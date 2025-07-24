# PII Masker Monorepo

A full-stack application for redacting Personally Identifiable Information (PII) from images. This monorepo contains both the backend (API and PII detection/masking logic) and frontend (user interface for uploading, analyzing, and downloading images).

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend](#backend)
- [Frontend](#frontend)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Approach](#approach)
- [Packages & Modules](#packages--modules)
- [Contributing](#contributing)
- [License](#license)

---

## Tech Stack

### Backend
- **Python 3.13**
- **FastAPI** (for REST API)
- **Pillow / OpenCV** (image processing)
- **Custom PII detection logic** (Regex + Spacy + easyOCR)
- **uvicorn** (ASGI server)

### Frontend
- **React** (with TypeScript)
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **bun** (package manager)
- **framer-motion** (animations)
- **lucide-react** (icons)

---

## Project Structure

```
backend/
  main.py            # FastAPI server entrypoint
  helper.py          # Utility functions for PII detection/masking
  requirements.txt   # Python dependencies
  pyproject.toml     # Python project config
  README.md          # Backend-specific docs
frontend/
  src/
    components/      # React UI components
    hooks/           # Custom React hooks
    lib/             # API and utility functions
    pages/           # Page-level components
    App.tsx          # Main app component
    main.tsx         # Entry point
  public/            # Static assets
  package.json       # Frontend dependencies
  tailwind.config.ts # Tailwind CSS config
  vite.config.ts     # Vite config
  README.md          # Frontend-specific docs
```

---

## Backend

- **main.py**: FastAPI app exposing endpoints for image upload, PII analysis, and redaction.
- **helper.py**: Contains core logic for detecting PII in images (e.g., OCR, regex, ML models) and masking/redacting detected regions.
- **requirements.txt**: Lists dependencies such as FastAPI, Pillow, OpenCV, and others.
- **pyproject.toml**: Project metadata and build configuration.

### Key Packages
- `fastapi`, `uvicorn`, `pillow`, `opencv-python`, `python-dotenv`, `pytesseract` (if OCR is used)

---

## Frontend

- **React + TypeScript**: SPA for uploading images, viewing PII analysis, and downloading masked images.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Vite**: Fast build tool and dev server.
- **bun**: Used for package management and scripts.
- **framer-motion**: For smooth UI animations.
- **lucide-react**: Icon library for modern UI.

### Key Modules
- `FileUpload.tsx`: Drag-and-drop image upload component.
- `PIIAnalysisResult.tsx`: Displays detected PII details and regions.
- `MaskedImageResult.tsx`: Shows and allows download of the redacted image.
- `hooks/usePIIMutations.ts`: Handles API calls for PII analysis and masking.
- `lib/api.ts`: API utility functions for backend communication.

---

## Setup & Installation

### Prerequisites
- Python 3.13+
- Node.js (for frontend)
- bun (recommended for frontend)

### Backend
```sh
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```sh
cd frontend
bun install
bun run dev
```

---

## Usage
1. Start the backend server (FastAPI).
2. Start the frontend dev server (Vite).
3. Open the frontend in your browser.
4. Upload an image containing text.
5. The app analyzes the image for PII, displays detected regions/types, and allows you to download a masked version.

---

## Approach
- **PII Detection**: Uses OCR enabled by easyOCR to extract text regions from images. Applies regex and a spacy model to identify PII (names, emails, phone numbers, etc.).
- **Redaction**: Masks detected PII regions in the image (e.g., blurring, black boxes).
- **Frontend**: Provides a modern, responsive UI for uploading images, viewing analysis, and downloading results. All API communication is handled via REST endpoints.
- **Modular Design**: Both backend and frontend are organized for scalability and maintainability.

---

## Packages & Modules

### Backend
- `fastapi`, `uvicorn`, `pillow`, `opencv-python`, `pytesseract`, `python-dotenv`

### Frontend
- `react`, `typescript`, `vite`, `tailwindcss`, `bun`, `framer-motion`, `lucide-react`

---

## Contributing
Pull requests and issues are welcome! Please see the individual `README.md` files in `backend/` and `frontend/` for more details on contributing and development setup.

---

## License
This project is licensed under the MIT License.
