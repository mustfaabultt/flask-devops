"""
MHRS Pro - API Test Suite
pytest ile tüm ana endpointleri test eder.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# Test veritabanı (in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///./test_mhrs.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

# Test veritabanını oluştur
Base.metadata.create_all(bind=engine)

client = TestClient(app)

# Test verileri
TEST_USER = {
    "name": "Test Hasta",
    "tc_kimlik": "12345678901",
    "password": "Test123"
}

TEST_USER_2 = {
    "name": "Test Hasta 2",
    "tc_kimlik": "12345678902",
    "password": "Test456"
}


class TestAuth:
    """Kimlik doğrulama testleri"""

    def test_register_success(self):
        """Başarılı kayıt testi"""
        response = client.post("/register", json=TEST_USER)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == TEST_USER["name"]
        assert data["tc_kimlik"] == TEST_USER["tc_kimlik"]
        assert data["role"] == "patient"

    def test_register_duplicate(self):
        """Aynı TC ile tekrar kayıt testi"""
        response = client.post("/register", json=TEST_USER)
        assert response.status_code == 400
        assert "kayıtlı" in response.json()["detail"]

    def test_login_success(self):
        """Başarılı giriş testi"""
        response = client.post("/login", data={
            "username": TEST_USER["tc_kimlik"],
            "password": TEST_USER["password"]
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self):
        """Yanlış şifre ile giriş testi"""
        response = client.post("/login", data={
            "username": TEST_USER["tc_kimlik"],
            "password": "yanlis_sifre"
        })
        assert response.status_code == 401

    def test_login_wrong_tc(self):
        """Yanlış TC ile giriş testi"""
        response = client.post("/login", data={
            "username": "99999999999",
            "password": TEST_USER["password"]
        })
        assert response.status_code == 401


def get_token(tc_kimlik: str, password: str) -> str:
    """Yardımcı: Token almak için"""
    response = client.post("/login", data={
        "username": tc_kimlik,
        "password": password
    })
    return response.json()["access_token"]


class TestProfile:
    """Profil testleri"""

    def test_get_me(self):
        """Kullanıcı bilgisi alma testi"""
        token = get_token(TEST_USER["tc_kimlik"], TEST_USER["password"])
        response = client.get("/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == TEST_USER["name"]

    def test_update_profile(self):
        """Profil güncelleme testi"""
        token = get_token(TEST_USER["tc_kimlik"], TEST_USER["password"])
        update_data = {
            "email": "test@example.com",
            "phone": "05551234567",
            "blood_type": "A+",
            "weight": 75,
            "height": 180
        }
        response = client.patch("/me",
                                headers={"Authorization": f"Bearer {token}",
                                         "Content-Type": "application/json"},
                                json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["blood_type"] == "A+"
        assert data["weight"] == 75

    def test_unauthorized_access(self):
        """Yetkisiz erişim testi"""
        response = client.get("/me")
        assert response.status_code == 401


class TestLocations:
    """Lokasyon endpointleri testleri"""

    def test_get_cities(self):
        """İl listesi alma testi"""
        response = client.get("/cities")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestReportsAndTests:
    """Rapor ve tahlil testleri"""

    def test_get_reports(self):
        """Rapor listesi alma testi"""
        token = get_token(TEST_USER["tc_kimlik"], TEST_USER["password"])
        response = client.get("/me/reports", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_tests(self):
        """Tahlil listesi alma testi"""
        token = get_token(TEST_USER["tc_kimlik"], TEST_USER["password"])
        response = client.get("/me/tests", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestHealthCheck:
    """Sistem sağlık kontrolü"""

    def test_health(self):
        """Health check endpointi testi"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

    def test_index_page(self):
        """Ana sayfa testi"""
        response = client.get("/")
        assert response.status_code == 200
