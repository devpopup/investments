import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import api_router

app = FastAPI(
    title="Investment Prediction API",
    description="DCA projections, technical analysis, and ATH predictions",
    version="1.0.0",
)

default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
extra_origins = os.environ.get("CORS_ORIGINS", "").split(",")
allowed_origins = default_origins + [o.strip() for o in extra_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
