from fastapi import FastAPI

app = FastAPI(
    title="VayuGati Flow API",
    description="AI-Powered Traffic Root Cause Analysis and Decision Support System",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "message": "Welcome to VayuGati Flow 🚦"
    }