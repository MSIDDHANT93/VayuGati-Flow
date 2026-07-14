from fastapi import FastAPI
from app.config import get_settings
from app.routers import traffic

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="AI-Powered Traffic Root Cause Analysis and Decision Support System",
    version=settings.app_version,
    debug=settings.debug
)

# Include routers
app.include_router(traffic.router, prefix=settings.api_prefix)


@app.get("/")
def root():
    return {
        "message": "Welcome to VayuGati Flow 🚦",
        "version": settings.app_version,
        "api_prefix": settings.api_prefix
    }