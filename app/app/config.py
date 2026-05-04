"""
MHRS Uygulama Konfigürasyonu
Environment variables veya varsayılan değerler ile çalışır.
"""
import os

# Güvenlik
SECRET_KEY = os.getenv("SECRET_KEY", "mhrs_super_gizli_anahtar_2024_prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Veritabanı
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mhrs.db")

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# Uygulama
APP_TITLE = "MHRS - Merkezi Hastane Randevu Sistemi"
APP_VERSION = "2.0.0"
APP_DESCRIPTION = """
🏥 **MHRS Pro** - Merkezi Hastane Randevu Sistemi

Türkiye genelinde 81 il, yüzlerce hastane ve binlerce doktor ile 
hızlı ve güvenli randevu alma platformu.

## Özellikler
- 🔐 JWT tabanlı güvenli kimlik doğrulama
- 👨‍⚕️ Rol bazlı yetkilendirme (Admin, Doktor, Hasta)
- 📅 Akıllı randevu yönetimi (çakışma kontrolü)
- 🏥 81 il, hastane ve poliklinik hiyerarşisi
- 📊 Admin istatistik paneli
- 📋 Tıbbi rapor ve tahlil sonuçları
"""
