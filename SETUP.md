# Setup Guide

## STEP 1 — Install/check Node.js

Use Node.js 20 or newer.

Check:

```bash
node --version
npm --version
```

If Node.js is missing, install the current LTS version from the official Node.js website.

## STEP 2 — Open the project in VS Code

Extract the ZIP and open the `jd-assistant` folder in VS Code.

## STEP 3 — Open the VS Code terminal

Use:

```text
Terminal -> New Terminal
```

## STEP 4 — Install frontend dependencies

```bash
cd frontend
npm install
```

## STEP 5 — Install backend dependencies

Open another terminal or return to the project root:

```bash
cd backend
npm install
```

## STEP 6 — Create the backend `.env`

Inside:

```text
jd-assistant/backend/
```

copy `.env.example` to `.env`.

Example:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.5-flash
FRONTEND_URL=http://localhost:5173
```

Do not put the Gemini key in the frontend.

## STEP 7 — Obtain a Gemini API key

Create a Gemini API key from Google AI Studio / Gemini API.

Paste only the key value after:

```text
GEMINI_API_KEY=
```

## STEP 8 — Start the backend

From `jd-assistant/backend`:

```bash
npm run dev
```

Expected local backend:

```text
http://localhost:3001
```

Health check:

```text
http://localhost:3001/api/health
```

## STEP 9 — Start the frontend

From `jd-assistant/frontend`:

```bash
npm run dev
```

## STEP 10 — Open the frontend

Open:

```text
http://localhost:5173
```

## STEP 11 — Test the application

1. Paste a real JD.
2. Click **Analyze Job Description**.
3. Ask a question clearly answered by the JD.
4. Confirm evidence appears.
5. Ask something absent, such as:
   `Does the company provide free lunch?`
6. Confirm the answer is:
   `Not stated in this posting.`
7. Open **Interview Prep**.
8. Generate questions and inspect all three categories.

## STEP 12 — Common errors

### Missing Gemini API configuration

Check:

```text
backend/.env
```

Make sure:

```env
GEMINI_API_KEY=your_real_key
```

Restart the backend after editing `.env`.

### Frontend cannot reach backend

Check `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

Restart Vite after changing it.

### CORS error

For local development:

```env
FRONTEND_URL=http://localhost:5173
```

For production, set `FRONTEND_URL` to the deployed frontend origin.

### Gemini timeout/failure

Retry manually. The app intentionally does not auto-retry because that could create duplicate Gemini requests.

## STEP 13 — Deploy backend to Vercel

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Set Root Directory to:

```text
backend
```

4. Add environment variables:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` = `gemini-3.5-flash` (optional)
   - `FRONTEND_URL` = temporary frontend URL or update it later
5. Deploy.
6. Verify:

```text
https://YOUR-BACKEND.vercel.app/api/health
```

## STEP 14 — Deploy frontend to Vercel

1. Create a second Vercel project from the same repository.
2. Set Root Directory to:

```text
frontend
```

3. Add:

```text
VITE_API_URL=https://YOUR-BACKEND.vercel.app
```

4. Deploy.

## STEP 15 — Where to add Vercel environment variables

In each Vercel project:

```text
Project -> Settings -> Environment Variables
```

Backend:
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `FRONTEND_URL`

Frontend:
- `VITE_API_URL`

## STEP 16 — Connect deployed frontend and backend

After the frontend deploys:

1. Copy the frontend origin, for example:

```text
https://jd-assistant-frontend.vercel.app
```

2. Set that exact value in the backend Vercel project:

```text
FRONTEND_URL=https://jd-assistant-frontend.vercel.app
```

3. Redeploy the backend.
4. Confirm `VITE_API_URL` on the frontend points to the backend.
5. Test the complete flow.
