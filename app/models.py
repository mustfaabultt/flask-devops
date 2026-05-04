from datetime import date
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    tc_kimlik = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # admin, doctor, patient
    
    # Profil Detayları
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    blood_type = Column(String, nullable=True) # A+, B-, vb.
    gender = Column(String, nullable=True)
    birth_date = Column(Date, nullable=True)
    weight = Column(Integer, nullable=True) # kg
    height = Column(Integer, nullable=True) # cm

    # Eğer doktorsa bir polikliniğe bağlı olabilir
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    department = relationship("Department", back_populates="doctors")
    appointments_as_patient = relationship("Appointment", foreign_keys="Appointment.patient_id", back_populates="patient")
    appointments_as_doctor = relationship("Appointment", foreign_keys="Appointment.doctor_id", back_populates="doctor")

class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    districts = relationship("District", back_populates="city")

class District(Base):
    __tablename__ = "districts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    city = relationship("City", back_populates="districts")
    hospitals = relationship("Hospital", back_populates="district")

class Hospital(Base):
    __tablename__ = "hospitals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=False)
    district = relationship("District", back_populates="hospitals")
    departments = relationship("Department", back_populates="hospital")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True) # Mevcut verilerle uyum için nullable=True

    hospital = relationship("Hospital", back_populates="departments")
    doctors = relationship("User", back_populates="department")
    appointments = relationship("Appointment", back_populates="department")

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    status = Column(String, default="aktif")  # aktif, iptal, tamamlandi
    doctor_note = Column(Text, nullable=True)

    patient = relationship("User", foreign_keys=[patient_id], back_populates="appointments_as_patient")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="appointments_as_doctor")
    department = relationship("Department", back_populates="appointments")

class MedicalReport(Base):
    __tablename__ = "medical_reports"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    date = Column(Date, default=date.today)

    patient = relationship("User", foreign_keys=[patient_id])
    doctor = relationship("User", foreign_keys=[doctor_id])

class TestResult(Base):
    __tablename__ = "test_results"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    test_name = Column(String, nullable=False)
    result_value = Column(String, nullable=False)
    unit = Column(String, nullable=True)
    reference_range = Column(String, nullable=True)
    date = Column(Date, default=date.today)

    patient = relationship("User", foreign_keys=[patient_id])
