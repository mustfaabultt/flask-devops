"""
Randevu Router'ı
Randevu oluşturma, listeleme, güncelleme ve slot sorgu endpointleri
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date, time
from typing import List

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/appointments", tags=["Randevular"])


@router.get("/slots")
def get_available_slots(doctor_id: int, date_str: str, db: Session = Depends(get_db)):
    """Belirli bir doktor ve tarih için boş randevu saatlerini döner."""
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Geçersiz tarih formatı (YYYY-MM-DD).")

    booked_slots = db.query(models.Appointment.time).filter(
        models.Appointment.doctor_id == doctor_id,
        models.Appointment.date == target_date,
        models.Appointment.status == "aktif"
    ).all()
    booked_times = {slot[0].strftime("%H:%M") for slot in booked_slots}

    all_slots = []
    for hour in range(9, 17):
        for minute in [0, 15, 30, 45]:
            time_str = f"{hour:02d}:{minute:02d}"
            
            if target_date == date.today():
                if datetime.now().time() > time(hour, minute):
                    continue
            
            if time_str not in booked_times:
                all_slots.append(time_str)
    
    return all_slots


@router.post("/", response_model=schemas.AppointmentResponse)
def create_appointment(
    apt: schemas.AppointmentCreate,
    db: Session = Depends(get_db),
    patient: models.User = Depends(auth.check_role(["patient"]))
):
    """Yeni randevu alır (Sadece Hasta)."""
    
    now = datetime.now()
    requested_datetime = datetime.combine(apt.date, apt.time)
    if requested_datetime < now:
        raise HTTPException(status_code=400, detail="Geçmiş bir tarihe randevu alınamaz.")

    existing_patient_apt = db.query(models.Appointment).filter(
        models.Appointment.patient_id == patient.id,
        models.Appointment.date == apt.date,
        models.Appointment.time == apt.time,
        models.Appointment.status == "aktif"
    ).first()
    if existing_patient_apt:
        raise HTTPException(status_code=400, detail="Bu saatte zaten bir randevunuz bulunuyor.")

    existing_doctor_apt = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == apt.doctor_id,
        models.Appointment.date == apt.date,
        models.Appointment.time == apt.time,
        models.Appointment.status == "aktif"
    ).first()
    if existing_doctor_apt:
        raise HTTPException(status_code=400, detail="Doktorun bu saati dolu.")

    new_apt = models.Appointment(
        patient_id=patient.id,
        doctor_id=apt.doctor_id,
        department_id=apt.department_id,
        date=apt.date,
        time=apt.time,
        status="aktif"
    )
    db.add(new_apt)
    db.commit()
    db.refresh(new_apt)
    return new_apt


@router.get("/my", response_model=List[schemas.AppointmentResponse])
def get_my_appointments(
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user)
):
    """Kullanıcının (Hasta veya Doktor) randevularını listeler."""
    query = db.query(models.Appointment)
    
    if user.role == "patient":
        results = query.filter(
            models.Appointment.patient_id == user.id
        ).order_by(models.Appointment.date.desc(), models.Appointment.time.desc()).all()
    elif user.role == "doctor":
        results = query.filter(
            models.Appointment.doctor_id == user.id
        ).order_by(models.Appointment.date.desc(), models.Appointment.time).all()
    else:
        results = query.order_by(
            models.Appointment.date.desc(), models.Appointment.time
        ).all()

    for res in results:
        res.patient_name = res.patient.name
        res.doctor_name = res.doctor.name
        res.department_name = res.department.name
    
    return results


@router.patch("/{apt_id}", response_model=schemas.AppointmentResponse)
def update_appointment(
    apt_id: int,
    apt_update: schemas.AppointmentUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.get_current_user)
):
    """Randevu durumunu günceller (İptal - Hasta, Not Ekleme/Tamamla - Doktor)."""
    db_apt = db.query(models.Appointment).filter(models.Appointment.id == apt_id).first()
    if not db_apt:
        raise HTTPException(status_code=404, detail="Randevu bulunamadı.")

    if user.role == "patient":
        if db_apt.patient_id != user.id:
            raise HTTPException(status_code=403, detail="Yetkiniz yok.")
        if apt_update.status == "iptal":
            db_apt.status = "iptal"
    
    elif user.role == "doctor":
        if db_apt.doctor_id != user.id:
            raise HTTPException(status_code=403, detail="Yetkiniz yok.")
        if apt_update.status:
            db_apt.status = apt_update.status
        if apt_update.doctor_note:
            db_apt.doctor_note = apt_update.doctor_note
    
    elif user.role == "admin":
        if apt_update.status:
            db_apt.status = apt_update.status
            
    db.commit()
    db.refresh(db_apt)
    
    db_apt.patient_name = db_apt.patient.name
    db_apt.doctor_name = db_apt.doctor.name
    db_apt.department_name = db_apt.department.name
    
    return db_apt
