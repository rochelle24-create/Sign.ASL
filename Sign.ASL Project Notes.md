# Sign.ASL — Project Notes

Real-time ASL alphabet learning web app. Users see a reference sign image, sign it on their webcam, and the AI checks if they got it right.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16.2.4, TypeScript, Tailwind CSS |
| ML Backend | Flask + HuggingFace Transformers |
| HF Model | `prithivMLmods/Alphabet-Sign-Language-Detection` |
| Hand Overlay | @mediapipe/tasks-vision 0.10.x (Google CDN) |
| State Machine | XState 5 |
| Animations | Framer Motion 11 |
| Confetti | canvas-confetti |

---

## How to Run

```bash
# Terminal 1 — Frontend (runs on port 3001)
npm run dev -- --port 3001

# Terminal 2 — ML Backend (runs on port 5000)
cd server && python predict.py
```

---

## Key Files

| File | Purpose |
|---|---|
| `lib/game/machine.ts` | XState state machine (`idle → showingSign → waitingForInput → correct → complete`) |
| `hooks/useVideoClassifier.ts` | Polls Flask `/predict` every 300ms, stability ring buffer, captures screenshot on stable detection |
| `lib/capture/screenshot.ts` | Screenshot utility |
| `components/game/GameScreen.tsx` | Main wiring component |
| `components/game/CorrectModal.tsx` | Congratulations overlay — side-by-side reference image + your screenshot |
| `components/game/CuteLetter.tsx` | Animated cartoon letter shown on correct answer |
| `hooks/useWebcam.ts` | Camera stream management |
| `hooks/useHandLandmarker.ts` | MediaPipe landmark overlay (visual only) |
| `server/predict.py` | Flask server, HuggingFace image-classification pipeline |

---

## What's Done

- [x] Full Next.js app scaffolded and building cleanly
- [x] Flask ML server running with HuggingFace model (downloaded on first run, cached after)
- [x] Webcam feed with MediaPipe hand landmark overlay
- [x] Real-time ASL classification via Flask (polled every 300ms)
- [x] Stability ring buffer — only fires "correct" after a consistent detection
- [x] Screenshot captured at the exact moment of correct detection (from `useVideoClassifier`)
- [x] Congratulations modal with side-by-side reference sign + your screenshot
- [x] Animated cartoon letter character on correct answer
- [x] Confetti celebration effect

---

## To Do

- [ ] **Download reference sign images** — save ASL alphabet SVGs to `public/signs/A.svg`, `B.svg`, etc. for offline use. App currently falls back to Wikimedia Commons SVGs, then emoji placeholder.
- [ ] **Improve hand/background separation** — camera struggles to distinguish hand from complex backgrounds. Options to explore:
  - Use MediaPipe landmark coordinates to crop the bounding box around the hand before sending to Flask
  - Apply a background blur or segmentation mask on the canvas before classification
  - Add user guidance (e.g. "Use a plain background for best results")
- [ ] **Progress tracking** — track which letters the user has completed in the current session
- [ ] **Letter selection UI** — let users pick which letters to practice instead of sequential order
- [ ] **Score / streak display** — show how many in a row the user has gotten correct

---

## Architecture Notes

- Screenshot is captured inside `useVideoClassifier.sendFrame` at stable-detection time (not in a `useEffect`), because that's when the video element is guaranteed valid and playing.
- MediaPipe loads from Google CDN — no local `.task` file needed.
- MediaPipe is marked as `serverExternalPackages` so Turbopack doesn't try to bundle it.
- All camera/ML code is client-only via `dynamic({ ssr: false })`.
