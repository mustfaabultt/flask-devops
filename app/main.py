"""
MHRS - Merkezi Hastane Randevu Sistemi
Ana uygulama dosyası - Router'ları yükler ve uygulamayı başlatır.
"""
import logging
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import APP_TITLE, APP_VERSION, APP_DESCRIPTION, CORS_ORIGINS
from database import engine
import models, database, seed_data
from routers import auth_router, appointment_router, location_router, admin_router

# Logging konfigürasyonu
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("mhrs")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Uygulama başlangıcında veritabanını hazırla."""
    models.Base.metadata.create_all(bind=engine)
    db = database.SessionLocal()
    try:
        seed_data.populate_full_data(db)
    finally:
        db.close()
    logger.info("MHRS uygulaması başlatıldı.")
    yield
    logger.info("MHRS uygulaması kapatılıyor.")


app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Statik dosyalar
app.mount("/static", StaticFiles(directory="static"), name="static")

# Router'ları ekle
app.include_router(auth_router.router)
app.include_router(appointment_router.router)
app.include_router(location_router.router)
app.include_router(admin_router.router)


# Global hata yakalayıcı
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"İşlenmeyen hata: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin."}
    )


@app.get("/")
async def read_index():
    """Ana sayfa (index.html) döner."""
    return FileResponse("static/index.html")


@app.get("/health")
async def health_check():
    """Sağlık kontrolü endpointi (deploy için)."""
    return {"status": "ok", "version": APP_VERSION}
