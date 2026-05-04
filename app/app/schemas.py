from pydantic import BaseModel, ConfigDict
from datetime import date, time
from typing import List, Optional

# Token Şemaları
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    tc_kimlik: Optional[str] = None
    role: Optional[str] = None

# User Şemaları
class UserBase(BaseModel):
    name: str
    tc_kimlik: str
    role: Optional[str] = "patient"
    department_id: Optional[int] = None
    
    # Yeni Profil Alanları
    email: Optional[str] = None
    phone: Optional[str] = None
    blood_type: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    weight: Optional[int] = None
    height: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    blood_type: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    weight: Optional[int] = None
    height: Optional[int] = None

class UserResponse(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# City Şemaları
class CityBase(BaseModel):
    name: str

class CityResponse(CityBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# District Şemaları
class DistrictBase(BaseModel):
    name: str
    city_id: int

class DistrictResponse(DistrictBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Hospital Şemaları
class HospitalBase(BaseModel):
    name: str
    district_id: int

class HospitalResponse(HospitalBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Department Şemaları
class DepartmentBase(BaseModel):
    name: str
    hospital_id: Optional[int] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Appointment Şemaları
class AppointmentBase(BaseModel):
    doctor_id: int
    department_id: int
    date: date
    time: time

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    doctor_note: Optional[str] = None

class AppointmentResponse(AppointmentBase):
    id: int
    patient_id: int
    status: str
    doctor_note: Optional[str] = None
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    department_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Tıbbi Rapor Şemaları
class MedicalReportResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    doctor_name: Optional[str] = None
    title: str
    content: str
    date: date
    model_config = ConfigDict(from_attributes=True)

# Tahlil Sonuç Şemaları
class TestResultResponse(BaseModel):
    id: int
    patient_id: int
    test_name: str
    result_value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    date: date
    model_config = ConfigDict(from_attributes=True)
