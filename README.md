# JD Assistant — Grounded Q&A + Interview Prep

A lightweight full-stack take-home project for the HotJPT AI/ML Full-Stack Developer role.

The app accepts a job description, creates one reusable grounded representation of it, and then uses that same representation for:

1. Grounded question answering with evidence.
2. JD-specific interview preparation.

The Gemini API key stays on the backend.

## Problem

Job descriptions are long. Candidates want fast, trustworthy answers and focused interview preparation without generic AI guesses.

This project solves that by treating the pasted JD as the only source of truth.

## Features

- Paste and analyze a job description.
- Reuse the analyzed JD context during the current browser session.
- Ask unlimited questions without pasting the JD again.
- Return evidence for every grounded factual answer.
- Return exactly `Not stated in this posting.` when the JD does not support an answer.
- Generate Technical, Behavioral, and Role-Specific interview questions.
- Explain why every interview question is relevant to the JD.
- Responsive desktop/mobile UI.
- Friendly validation, timeout, API, and malformed-response handling.
- No database, authentication, LangChain, vector DB, Docker, or unnecessary infrastructure.

## Technology Stack

### Frontend
- React
- JavaScript
- Vite
- HTML
- CSS

### Backend
- Node.js
- Express
- Google Gemini API via the official `@google/genai` SDK

### Deployment
- Frontend: Vercel
- Backend: Vercel serverless function

## Architecture

```text
React Frontend
    |
    | POST /api/analyze
    v
Express Backend
    |
    v
Grounding Service
    |
    v
Gemini -> structured facts + exact evidence
    |
    v
Server validates that evidence exists in the original JD
    |
    v
Compact Grounded Context
   / \
  /   \
Q&A   Interview Prep
```

The frontend keeps the analyzed context in React state for the current browser session. A refresh resets it, which is intentional because no database is required.

## One Shared Grounding Engine

`backend/src/services/groundingService.js` is the central layer.

The initial analysis extracts:
- a short overview,
- atomic facts,
- a category for each fact,
- exact evidence copied from the JD,
- useful keywords.

Only evidence that can be found in the original JD survives server-side validation.

Both Q&A and Interview Prep operate on that same validated context.

## How "Not stated in this posting." Works

For Q&A:

1. Gemini receives only the validated grounded context, not outside information.
2. The prompt explicitly says the JD is the only source of truth.
3. Gemini must return `grounded: false` when support is missing.
4. The backend validates returned evidence against the previously validated evidence set.
5. If no valid evidence remains, the backend forces:

```text
Not stated in this posting.
```

This adds a deterministic backend guard instead of trusting prompt instructions alone.

## Evidence Extraction

During `/api/analyze`, Gemini is asked to return exact supporting excerpts from the JD.

The backend normalizes whitespace and checks that every returned evidence excerpt is actually present in the original JD. Unsupported facts are dropped.

## Gemini Integration

The backend uses:

```js
import { GoogleGenAI } from "@google/genai";
```

The default model is:

```text
gemini-3.5-flash
```

It is configurable with:

```text
GEMINI_MODEL=
```

Structured JSON output is requested with `responseMimeType: "application/json"` and a JSON schema.

Official Gemini documentation was used for the SDK and structured-output approach.

## Security

- `GEMINI_API_KEY` is backend-only.
- `.env` is gitignored.
- The frontend never receives the API key.
- Production secrets should be stored in Vercel Environment Variables.
- Error responses do not expose stack traces or API keys.

## Performance Decisions

- One initial analysis call creates reusable context.
- Q&A and Interview Prep reuse compact structured facts.
- The full JD is not resent for every user action.
- No database or vector store.
- No heavy frontend UI library.
- Separate loading states prevent unnecessary UI blocking.
- Buttons are disabled only while their own request is running.
- No automatic retries, avoiding duplicate Gemini calls.
- Request timeout handling prevents infinite loading.
- Small JSON responses keep network overhead low.

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.5-flash
FRONTEND_URL=http://localhost:5173
```

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

```env
VITE_API_URL=http://localhost:3001
```

## Local Setup

Requirements:
- Node.js 20+
- npm
- Gemini API key

Install:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Run backend:

```bash
cd backend
npm run dev
```

Run frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:3001/api/health
```

For beginner-friendly instructions, see [SETUP.md](./SETUP.md).

## API Endpoints

### `GET /api/health`

Returns backend health information.

### `POST /api/analyze`

Request:

```json
{
  "jobDescription": "..."
}
```

Response:

```json
{
  "message": "Job description analyzed.",
  "context": {
    "overview": "...",
    "facts": [
      {
        "category": "skills",
        "statement": "The role requires Node.js.",
        "evidence": "Experience with Node.js is required."
      }
    ],
    "keywords": ["Node.js"]
  }
}
```

### `POST /api/qa`

Request:

```json
{
  "question": "Is this role remote?",
  "context": {
    "overview": "...",
    "facts": [],
    "keywords": []
  }
}
```

Response:

```json
{
  "answer": "Yes, this role is remote.",
  "grounded": true,
  "evidence": [
    {
      "text": "This is a fully remote position.",
      "reason": "This directly states the work arrangement."
    }
  ]
}
```

Missing information:

```json
{
  "answer": "Not stated in this posting.",
  "grounded": false,
  "evidence": []
}
```

### `POST /api/interview-prep`

Request:

```json
{
  "context": {
    "overview": "...",
    "facts": [],
    "keywords": []
  }
}
```

Response:

```json
{
  "technical": [],
  "behavioral": [],
  "roleSpecific": []
}
```

Each item contains:
- `question`
- `reason`

## Vercel Deployment

### Backend

1. Push the project to GitHub.
2. In Vercel, create a new project from the repository.
3. Set **Root Directory** to `backend`.
4. Add environment variables:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` = `gemini-3.5-flash` (optional)
   - `FRONTEND_URL` = your deployed frontend origin, e.g. `https://your-frontend.vercel.app`
5. Deploy.
6. Test:

```text
https://your-backend.vercel.app/api/health
```

The backend includes `api/index.js` and `vercel.json`, so Express is exposed as a Vercel serverless function.

### Frontend

1. Create another Vercel project from the same repository.
2. Set **Root Directory** to `frontend`.
3. Vercel should detect Vite.
4. Add:

```text
VITE_API_URL=https://your-backend.vercel.app
```

5. Deploy.
6. Copy the final frontend URL.
7. Update the backend `FRONTEND_URL` to that exact origin and redeploy the backend if needed.

## Assumptions

- A browser refresh may clear analyzed state.
- Job descriptions are normal-sized text postings.
- The task does not require persistent sessions.
- Gemini availability and latency depend on Google's API.
- An initial analysis step is acceptable before Q&A.

## Trade-offs

### Why no backend session store?
Vercel serverless instances are ephemeral. An in-memory Express session would not be reliable across requests. A persistent cache or database would violate the assignment's simplicity goal.

Instead, the frontend keeps the compact analyzed context and sends it to the backend for subsequent actions.

### Why not send the entire JD every time?
That would be simpler, but slower and more expensive. The app sends compact validated facts after the initial analysis.

### Limitation
Because later Q&A operates on extracted facts, an obscure JD detail could theoretically be omitted during initial extraction. For this take-home, the prompt asks Gemini to extract comprehensive atomic facts. A production version could add provider-side context caching or a retrieval layer if requirements justified it.

## Error Handling

Handled cases include:
- empty JD,
- very short JD,
- empty question,
- missing API key,
- network failure,
- Gemini failure,
- malformed Gemini JSON,
- request timeout,
- interview generation failure.

User-facing messages are intentionally friendly and do not leak internal errors.

## What I Would Improve With More Time

- Add automated unit/integration tests.
- Add provider-side context caching for very large JDs.
- Add lightweight telemetry for latency and error rates.
- Add optional resume-to-JD comparison only after the required assignment is stable.

## How AI Tools Were Used

AI assistance was used to accelerate implementation, review architecture choices, improve prompts, and check the project against the assignment requirements.

The final design deliberately keeps the code small and understandable so every decision can be explained during a live review.
