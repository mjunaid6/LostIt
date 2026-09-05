from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.chroma_service import search_similar, store_embedding
from app.services.embedding_service import create_image_embedding
from app.services.firestore_service import get_item, save_item

router = APIRouter()


def validate_image(image: UploadFile):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed.",
        )


@router.post("/upload")
async def upload_item(
    image: UploadFile = File(...),
    item_type: str = Form(...),
    description: str = Form(""),
    user_id: str = Form(...),
    image_url: str = Form(""),
):
    validate_image(image)

    image_bytes = await image.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Empty image.",
        )

    item_id = str(uuid4())

    # 1. Generate CLIP image embedding.
    embedding = create_image_embedding(image_bytes)

    # 2. Store application metadata in Firestore.
    metadata = {
        "item_id": item_id,
        "user_id": user_id,
        "item_type": item_type,
        "description": description,
        "image_url": image_url,
        "filename": image.filename or "",
    }

    save_item(item_id, metadata)

    # 3. Store embedding + searchable metadata in ChromaDB.
    store_embedding(
        item_id=item_id,
        embedding=embedding,
        metadata=metadata,
    )

    return {
        "message": "Item uploaded and image embedding stored.",
        "item_id": item_id,
    }


@router.post("/match")
async def find_matches(
    image: UploadFile = File(...),
):
    validate_image(image)

    image_bytes = await image.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Empty image.",
        )

    # Generate embedding for the newly uploaded image.
    embedding = create_image_embedding(image_bytes)

    # Search ChromaDB for visually similar items.
    matches = search_similar(embedding)

    return {
        "count": len(matches),
        "matches": matches,
    }


@router.get("/{item_id}")
def get_item_by_id(item_id: str):
    item = get_item(item_id)

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Item not found.",
        )

    return item
