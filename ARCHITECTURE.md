# Draftly — Architecture & Technical Decisions

## 1. System Overview

Draftly is a full-stack document management and editing application built with a React frontend, FastAPI backend, and relational database.

The application follows a client-server architecture:

**React + TipTap → FastAPI REST API → SQLAlchemy → PostgreSQL**

The frontend handles document editing and user interactions. The backend manages document storage, access checks, sharing, and file imports.

## 2. Frontend Architecture

**Technologies:** React, Vite, TipTap, Lucide React, and CSS.

React manages application state and renders the dashboard and document editor.

TipTap provides rich-text editing capabilities, including headings, bold, italic, underline, and lists.

The interface includes:
- A dashboard displaying owned and shared documents
- Document creation and editing
- A formatting toolbar
- Document sharing controls
- Text and Markdown file imports
- A demonstration user switcher

The frontend communicates with the backend through HTTP requests.

## 3. Backend Architecture

**Technologies:** Python, FastAPI, SQLAlchemy, and Pydantic.

FastAPI provides REST endpoints for:

- Retrieving documents
- Creating documents
- Updating document titles and content
- Sharing documents
- Importing files
- Listing demonstration users

SQLAlchemy provides database models and persistence.

## 4. Data Model

The application uses three primary models.

**User**
- `id`
- `name`

**Document**
- `id`
- `title`
- `content`
- `owner_id`

**DocumentShare**
- `document_id`
- `user_id`

A document belongs to one owner and may be shared with additional users.

## 5. Sharing and Access Control

The application uses two seeded demo users: Alice and Bob.

A selected user ID is sent through the `X-User-ID` HTTP header.

The backend checks document ownership and sharing permissions before allowing access.

Only document owners can grant sharing access.

**Security limitation:** The demo header does not authenticate the caller. A production application would require verified user identity, secure sessions or tokens, and stronger authorization controls.

## 6. File Import

Draftly accepts UTF-8 `.txt` and `.md` files up to 1 MB.

Imported text becomes document content stored in the database.

Markdown files are imported as text rather than converted into fully formatted Markdown.

## 7. Persistence and Deployment

The application uses SQLite by default during local development and PostgreSQL in production.

Deployment is handled through Render:

- React frontend: Render Static Site
- FastAPI backend: Render Web Service
- PostgreSQL: Render managed database

The frontend uses the `VITE_API_URL` environment variable to connect to the deployed API.

The backend uses `DATABASE_URL` for database connectivity and `FRONTEND_URL` to configure the allowed frontend origin.

## 8. Testing

An automated backend test verifies:

1. A user can create a document.
2. Another user cannot access the document before sharing.
3. The owner can share the document.
4. The shared user can access the document afterward.

Additional testing would be required for production readiness.

## 9. Technical Tradeoffs

**REST instead of WebSockets:** REST reduced implementation complexity and supported a working prototype within the assessment time limit. It does not support live simultaneous editing.

**Manual saving instead of autosave:** Explicit saving made persistence behavior straightforward, although it increases the risk of unsaved changes.

**Seeded demo users instead of authentication:** This allowed the sharing workflow to be demonstrated quickly but is not suitable for production security.

**HTML storage for rich text:** Storing editor HTML simplifies integration with TipTap, but production use requires appropriate content sanitization and security controls.

## 10. Future Improvements

- Secure authentication and session management
- Real-time collaboration using WebSockets and conflict resolution
- Autosave and unsaved-change warnings
- Document version history
- Comments and collaboration activity
- HTML sanitization and stronger input validation
- Expanded automated test coverage
- Improved accessibility and mobile responsiveness

## Conclusion

Draftly prioritizes a working end-to-end document workflow, persistent storage, a clean user interface, and basic server-side access checks.

The architecture is intentionally lightweight, with clear opportunities for extending the prototype into a production-ready collaborative editor.