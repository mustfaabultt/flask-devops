FROM python:3.9-slim

WORKDIR /app

# Bağımlılıklar
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt uvicorn

# Tüm dosyaları kopyala
COPY app/ .

# Veri tabanı dosyasının tam orada olduğundan emin ol ve yetki ver
RUN chmod -R 777 /app

# Uygulamayı ÇALIŞTIRACAĞIMIZ KLASÖRE GİR
WORKDIR /app/app

EXPOSE 8000

# Uygulamayı başlat
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
