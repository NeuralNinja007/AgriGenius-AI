# AgriGenius

AgriGenius is a production-ready AI agricultural assistant for English and
Arabic-speaking users in the Gulf region. It helps with crop care, pests,
fertilizer, irrigation, weather-aware guidance, market questions, voice input,
text-to-speech, and crop image analysis through a React/Vite frontend and a
FastAPI backend powered by OpenRouter.

This repository is prepared as the v1.0 release candidate.

## Features

- AI chat for practical agricultural guidance
- English and Arabic interface support
- Speech-to-text and text-to-speech controls
- Crop image upload/camera input for visual diagnosis workflows
- Weather and location-aware farming recommendations
- Local conversation history in the browser
- FastAPI backend with OpenRouter integration
- Responsive React/Vite frontend designed for mobile, tablet, and desktop

## Repository Structure

```text
agrigenius-project/
├── backend/
│   ├── app/
│   │   ├── api/          FastAPI routers and API dependencies
│   │   ├── core/         Configuration and logging
│   │   ├── prompts/      Agricultural assistant system prompts
│   │   ├── schemas/      Pydantic request and response models
│   │   ├── services/     External service clients such as OpenRouter
│   │   ├── utils/        Shared backend helpers
│   │   └── main.py       FastAPI app factory
│   ├── main.py           Compatibility entry point for uvicorn main:app
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/          Application shell and document preferences
│   │   ├── assets/       Images and static assets
│   │   ├── components/   Shared common and UI components
│   │   ├── config/       Localization and app constants
│   │   ├── features/     Chat, sidebar, and weather feature modules
│   │   ├── services/     API clients and local storage adapters
│   │   ├── styles/       Global and app-level styles
│   │   └── utils/        Formatting, image, and speech helpers
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── .env.example
├── .gitignore
├── README.md
└── runtime.txt
```

Generated folders such as `frontend/node_modules/`, `frontend/dist/`,
`backend/__pycache__/`, `.pnpm-store/`, virtual environments, and local `.env`
files are intentionally excluded from the release.

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- Python 3.10 or newer
- OpenRouter API key

## Environment

Copy the example files before running locally:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend variables:

- `OPENROUTER_API_KEY`: required for AI responses.
- `OPENROUTER_MODEL`: optional model override. Defaults to `openrouter/free`.
- `ALLOWED_ORIGINS`: comma-separated list of frontend origins allowed by CORS.

Frontend variables:

- `VITE_API_BASE_URL`: optional API base URL. Defaults to `/api`.

Never commit real `.env` files, API keys, tokens, or platform secrets.

## Local Development

Start the backend:

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API runs at `http://localhost:8000`. FastAPI documentation is available at
`http://localhost:8000/docs`.

Start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. During local development, Vite
proxies `/api/*` requests to the backend on port 8000.

## Production Build

```bash
cd frontend
npm ci
npm run build
```

The built frontend is emitted to `frontend/dist/`. Deploy the backend to any
Python host that supports FastAPI/Uvicorn and configure environment variables
in the hosting platform.

## Release Checklist

- Generated dependency and build folders are ignored.
- `.env.example` files contain placeholders only.
- Real `.env` files are ignored.
- Backend routes, prompt logic, and provider integration are separated.
- Frontend UI, feature, service, and utility code are organized by concern.
- Browser-only data such as chat history remains in local storage.

## Privacy And Security Notes

- The browser stores recent conversations locally using `localStorage`.
- Browser geolocation is requested only for weather/location context.
- AI requests are sent from the backend to OpenRouter using the configured API
  key.
- Do not expose backend secrets in frontend environment variables.
