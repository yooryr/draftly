# Draftly — AI-Assisted Development Workflow

## 1. Overview

I developed Draftly with assistance from ChatGPT as a coding and problem-solving tool.

AI helped accelerate implementation, explain unfamiliar configurations, troubleshoot issues, and organize the development process.

I used an iterative workflow: generate a solution, implement it locally, inspect the result, test the functionality, and refine it when necessary.

## 2. How I Used AI

### Planning and Architecture

I used ChatGPT to break the assessment into manageable milestones and identify a practical technology stack.

The selected architecture consisted of React and TipTap for the frontend, FastAPI and SQLAlchemy for the backend, and PostgreSQL for production persistence.

### Backend Development

AI assisted with drafting database models, API endpoints, document-sharing logic, and file-import handling.

I implemented the suggested changes and tested the resulting application.

### Frontend Development

AI helped structure the React interface, integrate TipTap, and develop the dashboard and editor styling.

I reviewed the interface locally, tested the editing workflow, and made visual refinements.

### Version Control and GitHub

I managed the GitHub repository, staged and committed project changes, and pushed updates to the remote repository.

I used Git to track development progress and maintain the application's source code.

### Deployment

I deployed the application using Render, including the frontend, backend, and PostgreSQL database.

ChatGPT assisted with troubleshooting deployment configurations, environment variables, and communication between application services.

I configured the services and verified that the deployed application was accessible.

### Documentation

AI assisted with organizing and drafting the README, architecture explanation, and development workflow notes.

## 3. Validation and Testing

I did not treat generated code as automatically correct.

I validated the implementation through:

- Running the frontend and backend locally
- Testing document creation and editing
- Verifying rich-text formatting
- Saving documents and reopening them
- Switching between demonstration users
- Testing document sharing
- Testing file imports
- Running an automated backend test
- Checking the deployed backend health endpoint

The automated test covered document creation, access restrictions, and sharing.

## 4. Technical Decisions and Tradeoffs

I prioritized delivering a working, deployed application within the assessment timeframe.

I chose a REST-based architecture instead of implementing real-time synchronization.

I used seeded demonstration users instead of building a complete authentication system.

I retained manual saving rather than introducing autosave.

These choices reduced complexity while preserving the core document workflow.

## 5. Limitations of AI Assistance

AI-generated suggestions still required implementation, configuration, and testing.

Some recommendations needed adjustments to match the project environment.

I also recognize that a functioning prototype is not equivalent to a production-ready application.

Further work would be necessary for secure authentication, content sanitization, comprehensive automated tests, and concurrent editing.

## 6. Reflection

AI was most useful for accelerating repetitive development tasks, explaining implementation choices, and helping troubleshoot configuration issues.

The process reinforced the importance of testing generated code, understanding system behavior, and making explicit tradeoffs.

The final application represents an AI-assisted development process supported by hands-on implementation and validation.