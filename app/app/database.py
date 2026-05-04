"""
Veritabanı Konfigürasyonu
SQLAlchemy engine, session ve base sınıfı
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import DATABASE_URL

# Engine oluşturma
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Veritabanı oturum sınıfı
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Modeller için temel sınıf
Base = declarative_base()


def get_db():
    """Veritabanı oturumu bağımlılığı (Dependency)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
