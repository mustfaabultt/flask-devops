FROM python:3.9-slim

# Gerekli sistem paketlerini kur (sqlite için)
RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Bağımlılıklar
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt uvicorn

# Tüm dosyaları kopyala
COPY app/ .

# Veri tabanı ve her şeye yazma yetkisi ver
RUN chmod -R 777 /app

EXPOSE 8000

# Uygulamayı en üst klasörden (app/) düzgün bir yolla çalıştır
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
