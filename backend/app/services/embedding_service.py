from functools import lru_cache
from io import BytesIO

from PIL import Image
from sentence_transformers import SentenceTransformer

MODEL_NAME = "clip-ViT-B-32"


@lru_cache(maxsize=1)
def get_model():
    return SentenceTransformer(MODEL_NAME)


def create_image_embedding(image_bytes: bytes) -> list[float]:
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    model = get_model()

    # normalize_embeddings=True makes cosine similarity straightforward.
    embedding = model.encode(image, normalize_embeddings=True)

    return embedding.tolist()
