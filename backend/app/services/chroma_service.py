import chromadb
from app.config import (
    CHROMA_COLLECTION,
    CHROMA_PERSIST_DIR,
    MATCH_LIMIT,
    SIMILARITY_THRESHOLD,
)

_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)

_collection = _client.get_or_create_collection(
    name=CHROMA_COLLECTION,
    metadata={"hnsw:space": "cosine"},
)


def store_embedding(
    item_id: str,
    embedding: list[float],
    metadata: dict,
):
    # Chroma IDs must be unique.
    _collection.upsert(
        ids=[item_id],
        embeddings=[embedding],
        metadatas=[metadata],
    )


def search_similar(embedding: list[float]):
    result = _collection.query(
        query_embeddings=[embedding],
        n_results=MATCH_LIMIT,
        include=["metadatas", "distances"],
    )

    ids = result.get("ids", [[]])[0]
    metadatas = result.get("metadatas", [[]])[0]
    distances = result.get("distances", [[]])[0]

    matches = []

    for item_id, metadata, distance in zip(ids, metadatas, distances):
        # Chroma returns cosine distance:
        # distance = 1 - cosine_similarity
        similarity = 1 - distance

        if similarity >= SIMILARITY_THRESHOLD:
            matches.append({
                "item_id": item_id,
                "similarity": round(similarity, 4),
                "payload": metadata,
            })

    return matches
