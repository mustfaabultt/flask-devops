"""
Kimlik Doğrulama Router'ı
Register, Login, Profil, Raporlar, Tahliller
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

import schemas, database, auth, models
from database import get_db

router = APIRouter(tags=["Kimlik Doğrulama"])


@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Yeni kullanıcı kaydı oluşturur. Sadece 'patient' rolü ile kayıt yapılabilir."""
    db_user = db.query(models.User).filter(models.User.tc_kimlik == user.tc_kimlik).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Bu TC Kimlik ile kayıtlı kullanıcı var.")
    
    hashed_password = auth.get_password_hash(user.password)
    
    new_user = models.User(
        name=user.name,
        tc_kimlik=user.tc_kimlik,
        password_hash=hashed_password,
        role="patient",
        department_id=None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Kullanıcı girişi yapar ve JWT döner."""
    user = db.query(models.User).filter(models.User.tc_kimlik == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hatalı TC Kimlik veya Şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.tc_kimlik})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(user: models.User = Depends(auth.get_current_user)):
    """Oturum açmış kullanıcının bilgilerini döner."""
    return user


@router.patch("/me", response_model=schemas.UserResponse)
def update_me(
    user_update: schemas.UserUpdate,
    user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcı profilini günceller."""
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me/reports", response_model=List[schemas.MedicalReportResponse])
def get_my_reports(
    user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcının tıbbi raporlarını listeler."""
    reports = db.query(models.MedicalReport).filter(
        models.MedicalReport.patient_id == user.id
    ).order_by(models.MedicalReport.date.desc()).all()
    
    for r in reports:
        doc = db.query(models.User).filter(models.User.id == r.doctor_id).first()
        r.doctor_name = doc.name if doc else "Bilinmeyen Doktor"
    return reports


@router.get("/me/tests", response_model=List[schemas.TestResultResponse])
def get_my_tests(
    user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcının tahlil sonuçlarını listeler."""
    return db.query(models.TestResult).filter(
        models.TestResult.patient_id == user.id
    ).order_by(models.TestResult.date.desc()).all()
