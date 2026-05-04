FROM python:3.9-slim

WORKDIR /app

# Gerekli sistem paketlerini kur
RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev && rm -rf /var/lib/apt/lists/*

# Bağımlılıklar
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt uvicorn

# TÜM DOSYALARI kopyala
COPY app/ .

# VERİ TABANINI KODLARIN YANINA TAŞI (Hata buradaydı!)
RUN cp mhrs.db app/mhrs.db || true

# YETKİLERİ VER
RUN chmod -R 777 /app

# Uygulamayı çalıştıracağımız yere gir
WORKDIR /app/app

EXPOSE 8000

# Uygulamayı ÇALIŞTIR
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
