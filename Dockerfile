FROM python:3.9-slim

WORKDIR /app

# Bağımlılıklar
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt uvicorn

# Her şeyi kopyala
COPY app/ .

# Veri tabanı ve her şeye yazma yetkisi
RUN chmod -R 777 /app

EXPOSE 8000

# Uygulamayı başlat (Klasör karmaşasını bitirmek için PYTHONPATH ekledik)
ENV PYTHONPATH=/app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
