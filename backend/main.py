from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import traffic, vision, reasoning, pipeline

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="AI-Powered Traffic Root Cause Analysis and Decision Support System",
    version=settings.app_version,
    debug=settings.debug
)

# CORS — allow the Vite dev server (and local preview) to call the API from the browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(traffic.router, prefix=settings.api_prefix)
app.include_router(vision.router, prefix=settings.api_prefix)
app.include_router(reasoning.router, prefix=settings.api_prefix)
app.include_router(pipeline.router, prefix=settings.api_prefix)


@app.get("/")
def root():
    return {
        "message": "Welcome to VayuGati Flow 🚦",
        "version": settings.app_version,
        "api_prefix": settings.api_prefix
    }