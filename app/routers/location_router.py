"""
Lokasyon Router'ı
İl, İlçe, Hastane, Poliklinik, Doktor hiyerarşik seçim endpointleri
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import models, schemas, database
from database import get_db

router = APIRouter(tags=["Lokasyonlar"])


@router.get("/cities", response_model=List[schemas.CityResponse])
def get_cities(db: Session = Depends(get_db)):
    """Tüm illeri listeler."""
    return db.query(models.City).order_by(models.City.name).all()


@router.get("/cities/{city_id}/districts", response_model=List[schemas.DistrictResponse])
def get_districts(city_id: int, db: Session = Depends(get_db)):
    """Seçilen ile ait ilçeleri listeler."""
    return db.query(models.District).filter(
        models.District.city_id == city_id
    ).order_by(models.District.name).all()


@router.get("/districts/{district_id}/hospitals", response_model=List[schemas.HospitalResponse])
def get_hospitals(district_id: int, db: Session = Depends(get_db)):
    """Seçilen ilçeye ait hastaneleri listeler."""
    return db.query(models.Hospital).filter(
        models.Hospital.district_id == district_id
    ).order_by(models.Hospital.name).all()


@router.get("/hospitals/{hospital_id}/departments", response_model=List[schemas.DepartmentResponse])
def get_hospital_departments(hospital_id: int, db: Session = Depends(get_db)):
    """Seçilen hastaneye ait poliklinikleri listeler."""
    return db.query(models.Department).filter(
        models.Department.hospital_id == hospital_id
    ).order_by(models.Department.name).all()


@router.get("/departments/{dept_id}/doctors", response_model=List[schemas.UserResponse])
def get_dept_doctors(dept_id: int, db: Session = Depends(get_db)):
    """Seçilen poliklinikteki doktorları listeler."""
    return db.query(models.User).filter(
        models.User.department_id == dept_id,
        models.User.role == "doctor"
    ).order_by(models.User.name).all()
