FROM python:3.9-slim

WORKDIR /app

# Bağımlılıkları yükle
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Tüm uygulama dosyalarını kopyala
COPY app/ .

# Portu aç
EXPOSE 5000

# Uygulamayı çalıştır
CMD ["python", "app/main.py"]
