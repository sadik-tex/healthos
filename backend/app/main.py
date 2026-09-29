from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.routes import router as auth_router
from app.dashboard.routes import router as dashboard_router
from app.health.routes import router as health_router
from app.mood.routes import router as mood_router


app = FastAPI(title="HealthOS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(health_router)
app.include_router(mood_router)


@app.get("/")
def root():
    return {"message": "HealthOS API is running"}