from contextlib import asynccontextmanager
from pathlib import Path
from html import escape

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select, or_
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import User, Document, DocumentShare


def get_db():
    with SessionLocal() as db:
        yield db


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        for user_id, name in [(1, "Alice"), (2, "Bob")]:
            if not db.get(User, user_id):
                db.add(User(id=user_id, name=name))
        db.commit()
    yield


app = FastAPI(title="Draftly API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DocumentInput(BaseModel):
    title: str = Field(default="Untitled Document", min_length=1, max_length=200)
    content: str = ""


class DocumentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = None


class ShareInput(BaseModel):
    user_id: int


def current_user(
    x_user_id: int = Header(default=1),
    db: Session = Depends(get_db),
):
    user = db.get(User, x_user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Unknown demo user")
    return user


def serialize(doc, user_id, db):
    shares = db.scalars(
        select(DocumentShare.user_id).where(
            DocumentShare.document_id == doc.id
        )
    ).all()
    return {
        "id": doc.id,
        "title": doc.title,
        "content": doc.content,
        "owner_id": doc.owner_id,
        "shared_with": shares,
        "is_owner": doc.owner_id == user_id,
    }


def accessible_document(document_id, user, db):
    doc = db.get(Document, document_id)
    if not doc:
        raise HTTPException(404, "Document not found")

    if doc.owner_id != user.id:
        share = db.scalar(
            select(DocumentShare).where(
                DocumentShare.document_id == document_id,
                DocumentShare.user_id == user.id,
            )
        )
        if not share:
            raise HTTPException(403, "Access denied")
    return doc


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/users")
def users(db: Session = Depends(get_db)):
    return db.scalars(select(User)).all()


@app.get("/documents")
def list_documents(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    shared_ids = select(DocumentShare.document_id).where(
        DocumentShare.user_id == user.id
    )
    docs = db.scalars(
        select(Document).where(
            or_(
                Document.owner_id == user.id,
                Document.id.in_(shared_ids),
            )
        ).order_by(Document.id.desc())
    ).all()
    return [serialize(doc, user.id, db) for doc in docs]


@app.post("/documents", status_code=201)
def create_document(
    data: DocumentInput,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    doc = Document(
        title=data.title,
        content=data.content,
        owner_id=user.id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return serialize(doc, user.id, db)


@app.get("/documents/{document_id}")
def get_document(
    document_id: int,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    doc = accessible_document(document_id, user, db)
    return serialize(doc, user.id, db)


@app.patch("/documents/{document_id}")
def update_document(
    document_id: int,
    data: DocumentUpdate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    doc = accessible_document(document_id, user, db)
    if data.title is not None:
        doc.title = data.title
    if data.content is not None:
        doc.content = data.content
    db.commit()
    db.refresh(doc)
    return serialize(doc, user.id, db)


@app.post("/documents/{document_id}/share")
def share_document(
    document_id: int,
    data: ShareInput,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    doc = accessible_document(document_id, user, db)
    if doc.owner_id != user.id:
        raise HTTPException(403, "Only the owner can share")

    if not db.get(User, data.user_id):
        raise HTTPException(404, "User not found")

    if data.user_id == user.id:
        raise HTTPException(400, "Owner already has access")

    existing = db.scalar(
        select(DocumentShare).where(
            DocumentShare.document_id == document_id,
            DocumentShare.user_id == data.user_id,
        )
    )
    if not existing:
        db.add(DocumentShare(
            document_id=document_id,
            user_id=data.user_id,
        ))
        db.commit()

    return {"message": "Document shared successfully"}


@app.post("/documents/import", status_code=201)
async def import_document(
    file: UploadFile = File(...),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    filename = Path(file.filename or "").name
    extension = Path(filename).suffix.lower()

    if extension not in {".txt", ".md"}:
        raise HTTPException(400, "Only .txt and .md files are supported")

    raw = await file.read(1024 * 1024 + 1)
    if len(raw) > 1024 * 1024:
        raise HTTPException(413, "Maximum file size is 1 MB")

    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(400, "File must be UTF-8 encoded")

    # Imported text is escaped before entering the rich-text editor.
    content = "<p>" + escape(text).replace("\n", "<br>") + "</p>"

    doc = Document(
        title=Path(filename).stem[:200] or "Imported Document",
        content=content,
        owner_id=user.id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return serialize(doc, user.id, db)