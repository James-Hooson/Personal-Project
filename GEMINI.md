# Project Overview

This is a boilerplate project for a full-stack web application using the following technologies:

*   **Frontend:** React, Vite, TypeScript, Tailwind CSS
*   **Backend:** Node.js, Express, TypeScript
*   **API Communication:** `superagent` and React Query

The project is structured with a `client` directory for the React frontend and a `server` directory for the Express backend.

The application fetches a random greeting from the backend and displays it. The user can click a button to fetch a new greeting.

## Building and Running

### Development

Prompt the user to run the development server themselves in a separate terminal window.

```bash
npm run dev
```

This will start the Vite development server for the client and the `tsx` watcher for the server.

- The client will be available at `http://localhost:5173`.
- The server will be available at `http://localhost:3000`.

### Production

To build the project for production, use the following command:

```bash
npm run build
```

This will create a `dist` directory with the bundled client and server files.

To start the server in production mode, use the following command:

```bash
npm start
```

### Testing

To run the tests, use the following command:

```bash
npm test -- --run
```

## Development Conventions

### Linting

This project uses ESLint to enforce code quality. To run the linter, use the following command:

```bash
npm run lint
```

### Formatting

This project uses Prettier to format the code. To format the code, use the following command:

```bash
npm run format
```

# Development Conventions

*   The project uses TypeScript for both the frontend and backend.
*   Styling is done with Tailwind CSS.
*   The project uses `eslint` and `prettier` for code quality and consistency.
*   API requests are handled by `superagent` and managed with React Query.
*   The backend provides a single API endpoint at `/api/v1/greeting` which returns a random greeting.

## PromptKit Quick Reference
- Review the available artefacts when the student requests them:
  - Protocol: `promptkit/protocols/setup.md` — instructions for updating these CLI briefings.
  - Workflow: `promptkit/workflows/tutor.md` — guide for tutoring/explanation sessions.
  - Workflow: `promptkit/workflows/reflect.md` — guide for documenting outcomes and next steps.
- Student notes live in `promptkit/notes/`; The table in `progress-journal.md` is main place to update with reflections. Instructor Activities are in `promptkit/activities/` (read-only).
- When new workflows arrive, expect additional files under `promptkit/workflows/`.