import os
from dotenv import load_dotenv

load_dotenv()

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_data")
CHROMA_COLLECTION = os.getenv("CHROMA_COLLECTION", "lostit_images")
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.65"))
MATCH_LIMIT = int(os.getenv("MATCH_LIMIT", "5"))

FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS", "")
FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "")
