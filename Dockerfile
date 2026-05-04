FROM python:3.9-slim

WORKDIR /app

# Bağımlılıkları yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Tüm dosyaları kopyala
COPY . .

# Flask'ın çalışacağı portu aç
EXPOSE 5000

# Uygulamayı çalıştır (Ana dosya app/main.py olduğu için yolu belirttik)
CMD ["python", "app/main.py"]
