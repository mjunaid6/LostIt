from google.cloud import firestore
from google.oauth2 import service_account

from app.config import FIREBASE_CREDENTIALS

_db = None


def get_db():
    global _db

    if _db is not None:
        return _db

    if FIREBASE_CREDENTIALS:
        credentials = service_account.Credentials.from_service_account_file(
            FIREBASE_CREDENTIALS
        )
        _db = firestore.Client(credentials=credentials)
    else:
        # Uses GOOGLE_APPLICATION_CREDENTIALS / Application Default Credentials.
        _db = firestore.Client()

    return _db


def save_item(item_id: str, data: dict):
    get_db().collection("lost_items").document(item_id).set(data)


def get_item(item_id: str):
    doc = get_db().collection("lost_items").document(item_id).get()
    return doc.to_dict() if doc.exists else None
