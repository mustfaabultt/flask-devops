# 🏥 SağlıkCepte - Yeni Nesil Randevu Sistemi

**SağlıkCepte**, Türkiye genelindeki tüm hastane ve doktorlara tek bir noktadan, en hızlı ve en güvenli şekilde erişmenizi sağlayan profesyonel bir sağlık platformudur.

---

## 🌟 Öne Çıkan Özellikler

### 📱 Mobil Erişim & Responsive Tasarım
Uygulama tüm cihazlarda (Telefon, Tablet, PC) kusursuz çalışır. Modern "Light Theme" tasarımı ile göz yormaz ve kurumsal bir deneyim sunar.

### 🔐 Profesyonel Güvenlik
- **JWT Auth:** Güvenli oturum yönetimi.
- **Şifreleme:** `passlib` (bcrypt) ile veritabanı güvenliği.
- **Rol Yönetimi:** Hasta, Hekim ve Yönetici için ayrı yetkiler.

### 📅 Randevu Sihirbazı
- 5 adımlı kolay randevu alımı (İl/İlçe -> Hastane -> Klinik -> Doktor -> Saat).
- Akıllı slot yönetimi ve çakışma kontrolü.

---

## 🚀 Hızlı Başlangıç (Geliştirici & Hoca İçin)

### 1. Yerel Ağdan (Telefondan) Erişim
Aynı Wi-Fi üzerinden telefonunuzdan bağlanmak için:
1. Terminalde sunucuyu şu komutla başlatın:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8003
   ```
2. Telefon tarayıcınızın adres çubuğuna şunu yazın:
   `http://192.168.1.151:8003`

### 2. Kurulum
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 🛠️ Teknik Altyapı
- **Backend:** FastAPI (Python)
- **Database:** SQLite & SQLAlchemy ORM
- **Frontend:** Vanilla JS & Modern CSS Grid/Flex
- **Test:** pytest (13+ API Test)

---

## 📁 Proje Yapısı
- `app/routers/`: Modüler API uç noktaları.
- `app/static/`: Premium arayüz dosyaları.
- `tests/`: Otomatik test senaryoları.
- `README.md`: Bu döküman.

---

*Bu proje eğitim amaçlı, profesyonel standartlarda geliştirilmiştir.*
