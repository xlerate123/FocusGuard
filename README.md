# FocusGuard 

A lightweight, privacy‑first web app that uses your webcam to detect attention and help you stay focused. It provides real‑time focus detection, Pomodoro/stopwatch timers, distraction alerts, and data export.

## Features
- **Real‑time focus detection** using `face-api.js` (no server, all processing in the browser).
- **Bento‑grid layout** – responsive 12‑column CSS Grid for a premium UI.
- **Pomodoro & stopwatch modes** with manual Start/Stop/Reset controls.
- **Audio alerts** for distraction events (left/right/look‑down and loss of focus).
- **Export session data** (JSON) for personal analytics.
- **Dark theme** with modern colors and smooth micro‑animations.

## Getting Started
```bash
# Clone the repo (if not already local)
git clone <repo-url>
cd FocusGuard

# Install dependencies
npm install

# Run the development server
npm run dev   # Vite dev server (or npm start if configured)
```
Open `http://localhost:5173` (or the URL shown in the console) in a modern browser.

## Project Structure
```
src/
├─ components/      # UI components (CameraView, FocusTimer, ExportData, …)
├─ context/         # FocusContext – global focus state
├─ hooks/           # useFocusDetection, useSound
├─ App.js           # Root component – assembles the Bento grid
└─ App.css          # Global styles & Bento‑grid definitions
```

## Scripts
- `npm run dev` – Starts the Vite development server.
- `npm run build` – Builds a production‑ready bundle.
- `npm run lint` – Runs ESLint (if configured).

## Contributing
Feel free to open issues or submit pull requests. When adding new features, keep the **Bento‑grid** layout in mind and reuse existing hooks for consistency.

## License
MIT © 2025 Nikhil Mohanty.
