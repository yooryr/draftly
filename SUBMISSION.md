# Draftly — Technical Assessment Submission

**Position:** AI-Native Full Stack Developer  
**Company:** Ajaia LLC  
**Project:** Draftly — Collaborative Document Editor

## Project Links

- **Live Application:** [Open Draftly](https://draftly-app-jfpi.onrender.com/)
- **Backend API:** [View API](https://draftly-api-cde9.onrender.com/health)
- **GitHub Repository:** [View Source Code](https://github.com/yooryr/draftly)
- **Walkthrough Video:** [Watch Demo](https://drive.google.com/file/d/1ttk9V-eRZVWkczE3_I8X0MhYRFrCJjJD/view?usp=sharing)
- **Submission Folder:** [View Deliverables](https://drive.google.com/drive/folders/1ZffGKHkcA6x58__XuKeoMIcbEoOBK4P3?usp=sharing)

## Project Summary

Draftly is a full-stack document editor that allows users to create, edit, format, save, import, and share documents.

The application uses React and TipTap for the frontend, FastAPI for the backend, and PostgreSQL for production data persistence.

## Implemented Features

- Document creation and renaming
- Rich-text editing and formatting
- Manual saving and persistent storage
- Document sharing between demonstration users
- Server-side document access checks
- UTF-8 text and Markdown file imports
- Responsive user interface
- Automated backend test

## Technical Documentation

- `README.md` — Project overview and setup instructions
- `ARCHITECTURE.md` — Architecture, design decisions, and tradeoffs
- `AI_WORKFLOW.md` — AI-assisted development process
- `SUBMISSION.md` — Submission overview and links

## Testing

The backend automated test passed locally.

The application was also manually tested for document creation, editing, saving, sharing, file import, and persistence.

## Known Limitations

This is a demonstration prototype. It uses simulated user identities rather than production authentication, manual saving rather than autosave, and does not support simultaneous real-time editing.

## Walkthrough

The accompanying video demonstrates the deployed application, its core features, technical architecture, and development workflow.

## Demo Access

The application includes two simulated users, Alice and Bob.

- Select a user from the account switcher in the application.
- Create a document as Alice.
- Share the document with Bob using the Share button.
- Switch to Bob to view the document under Shared Documents.

No credentials are required. The account switcher is for demonstration purposes and is not production authentication.

## Submission Contents

The Google Drive folder contains:

- `Draftly_Source_Code.zip` — Complete project source code
- `README.md` — Setup and run instructions
- `ARCHITECTURE.md` — Architecture and design decisions
- `AI_WORKFLOW.md` — AI-assisted development workflow
- `SUBMISSION.md` — Project overview and submission links
- `walkthrough_link.txt` — Walkthrough video URL

## Next Steps (Additional 2–4 Hours)

With additional development time, I would prioritize:

1. Implementing proper user authentication.
2. Adding more granular document-sharing permissions.
3. Improving the collaboration experience with clearer editing and saving feedback.

Real-time simultaneous editing and document version history remain future enhancements beyond this timebox.