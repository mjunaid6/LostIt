from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.items import router as items_router

app = FastAPI(title="LostIt AI Matching API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items_router, prefix="/api/items", tags=["Items"])

@app.get("/health")
def health():
    return {"status": "ok"}
