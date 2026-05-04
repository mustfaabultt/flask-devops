FROM python:3.9-slim

WORKDIR /app

# Gerekli sistem paketleri
RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev && rm -rf /var/lib/apt/lists/*

# Bağımlılıklar
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt uvicorn

# Tüm dosyaları kopyala
COPY app/ .

# Veri tabanı ve klasöre tam yetki
RUN chmod -R 777 /app

EXPOSE 8000

# Uygulamayı başlat
ENV PYTHONPATH=/app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
