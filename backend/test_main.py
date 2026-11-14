
import os
import tempfile

# Use a separate database so tests don't alter demo documents.
fd, db_path = tempfile.mkstemp(suffix=".db")
os.close(fd)
os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

from fastapi.testclient import TestClient
from main import app

def test_document_creation_and_sharing():
    with TestClient(app) as client:
        alice = {"X-User-ID": "1"}
        bob = {"X-User-ID": "2"}

        created = client.post(
            "/documents",
            headers=alice,
            json={"title": "Test Document", "content": "<p>Hello</p>"}
        )
        assert created.status_code == 201
        doc_id = created.json()["id"]

        # Bob cannot access Alice's private document.
        private = client.get(
            f"/documents/{doc_id}", headers=bob
        )
        assert private.status_code == 403

        # Alice shares it with Bob.
        shared = client.post(
            f"/documents/{doc_id}/share",
            headers=alice,
            json={"user_id": 2}
        )
        assert shared.status_code == 200

        # Bob can now open the document.
        accessible = client.get(
            f"/documents/{doc_id}", headers=bob
        )
        assert accessible.status_code == 200
        assert accessible.json()["title"] == "Test Document"
