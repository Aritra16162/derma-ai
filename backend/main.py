"""
Derma Guide Backend — Application Entry Point

This module creates the FastAPI instance, registers middleware,
mounts API routers, and triggers model loading on startup.

Run with: uvicorn main:app --reload
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ml.vision import load_model
from api.routes import router as classify_router
from api.auth_routes import router as auth_router
from database import engine, Base

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle hook."""
    await load_model()
    yield  # app is running
    print("Shutting down Derma Guide Backend.")


app = FastAPI(
    title="Derma Guide Backend",
    description="AI-powered skin condition classification and triage API.",
    version="1.0.0",
    lifespan=lifespan,
)

import os

# ── CORS ────────────────────────────────────────────────────────────────
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://derma-ai-tt4m.vercel.app"
]

frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ──────────────────────────────────────────────────────────────
app.include_router(classify_router)
app.include_router(auth_router, prefix="/auth")
