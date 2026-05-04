FROM python:3.9-slim

WORKDIR /app

# Bağımlılıkları yükle
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt uvicorn

# Tüm dosyaları kopyala
COPY app/ .

# Veri tabanı dosyasına yazma yetkisi ver (Kayıt olabilmek için şart!)
RUN chmod 777 /app

# Portu aç
EXPOSE 8000

# Uygulamayı çalıştır
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
