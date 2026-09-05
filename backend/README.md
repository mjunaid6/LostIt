# LostIt — FastAPI + ChromaDB AI Image Matching Backend

## Architecture

React.js
   |
   | image upload
   v
FastAPI
   |
   +----> Firebase Storage (actual image)
   |
   +----> Firestore (item metadata)
   |
   +----> CLIP (image embedding)
              |
              v
          ChromaDB
              |
              | cosine similarity search
              v
       Top-K potential matches

## Technology

- FastAPI — REST backend
- CLIP (`clip-ViT-B-32`) — image embeddings
- ChromaDB — vector database
- Firestore — item metadata
- Firebase Storage — actual image files

## Setup

Create a virtual environment:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Linux/macOS:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## Firebase

Configure Google Cloud/Firebase credentials.

Option 1:

```bash
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\firebase-service-account.json
```

PowerShell:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\firebase-service-account.json"
```

Option 2: set `FIREBASE_CREDENTIALS` in `.env`.

Never commit the service-account JSON.

## Run

```bash
uvicorn app.main:app --reload
```

FastAPI Swagger:

```text
http://localhost:8000/docs
```

ChromaDB is embedded into the application and persists locally in:

```text
./chroma_data
```

No separate ChromaDB server is required for this setup.

## API

### Upload item

```text
POST /api/items/upload
```

Multipart fields:

- `image`
- `item_type`
- `description`
- `user_id`
- `image_url`

The endpoint:

1. Reads the image.
2. Generates a CLIP embedding.
3. Stores item metadata in Firestore.
4. Stores the embedding in ChromaDB.

### Find matches

```text
POST /api/items/match
```

Multipart field:

- `image`

The endpoint:

1. Generates a CLIP embedding for the uploaded image.
2. Queries ChromaDB.
3. Calculates similarity from Chroma's cosine distance.
4. Removes results below `SIMILARITY_THRESHOLD`.
5. Returns the remaining matches.

Example:

```json
{
  "count": 2,
  "matches": [
    {
      "item_id": "8d6...",
      "similarity": 0.8732,
      "payload": {
        "item_id": "8d6...",
        "user_id": "user123",
        "item_type": "wallet",
        "description": "Black leather wallet",
        "image_url": "https://..."
      }
    }
  ]
}
```

## Important ChromaDB detail

The collection is configured with:

```text
hnsw:space = cosine
```

Chroma returns cosine distance. For normalized embeddings:

```text
cosine similarity = 1 - cosine distance
```

The API exposes this as `similarity`.

## Recommended project flow

When a user reports an item:

```text
React
  ↓
Upload image to Firebase Storage
  ↓
Get image URL
  ↓
POST /api/items/upload
  ↓
CLIP embedding
  ↓
ChromaDB
```

When a user searches using an image:

```text
React
  ↓
POST /api/items/match
  ↓
CLIP embedding
  ↓
ChromaDB similarity search
  ↓
Top matching item IDs + metadata
  ↓
React UI
```

## Production considerations

For a production deployment, consider:

- Restrict CORS to the React application's domain.
- Add authentication/JWT validation.
- Validate maximum image size.
- Validate image dimensions.
- Keep Firebase service-account credentials outside Git.
- Use a managed/persistent Chroma deployment if the API runs across multiple instances.
- Tune `SIMILARITY_THRESHOLD` against a labeled set of actual lost/found images.
- Consider filtering searches by `item_type` before vector search when appropriate.
