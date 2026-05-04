"""
Admin Router'ı
İstatistik dashboard, kullanıcı yönetimi endpointleri
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import List

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.check_role(["admin"]))
):
    """Admin dashboard istatistiklerini döner."""
    today = date.today()
    
    total_users = db.query(func.count(models.User.id)).scalar()
    total_patients = db.query(func.count(models.User.id)).filter(models.User.role == "patient").scalar()
    total_doctors = db.query(func.count(models.User.id)).filter(models.User.role == "doctor").scalar()
    
    total_appointments = db.query(func.count(models.Appointment.id)).scalar()
    active_appointments = db.query(func.count(models.Appointment.id)).filter(
        models.Appointment.status == "aktif"
    ).scalar()
    cancelled_appointments = db.query(func.count(models.Appointment.id)).filter(
        models.Appointment.status == "iptal"
    ).scalar()
    completed_appointments = db.query(func.count(models.Appointment.id)).filter(
        models.Appointment.status == "tamamlandi"
    ).scalar()
    
    today_appointments = db.query(func.count(models.Appointment.id)).filter(
        models.Appointment.date == today,
        models.Appointment.status == "aktif"
    ).scalar()
    
    # Son 7 günün randevu dağılımı
    weekly_data = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        count = db.query(func.count(models.Appointment.id)).filter(
            models.Appointment.date == d
        ).scalar()
        weekly_data.append({
            "date": d.strftime("%d/%m"),
            "day": ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"][d.weekday()],
            "count": count
        })
    
    return {
        "total_users": total_users,
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "active_appointments": active_appointments,
        "cancelled_appointments": cancelled_appointments,
        "completed_appointments": completed_appointments,
        "today_appointments": today_appointments,
        "weekly_data": weekly_data
    }


@router.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.check_role(["admin"]))
):
    """Tüm kullanıcıları listeler."""
    return db.query(models.User).order_by(models.User.id).all()
