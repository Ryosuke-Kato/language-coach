# LanguageCoach 🎓

An AI-powered language learning web app for A2→B2 learners. Practice **listening comprehension** and **speaking skills** with AI-generated content, instant feedback, and smart quizzes — powered by OpenAI GPT-4o, TTS, and Whisper.

> **Try the demo** — run with `NEXT_PUBLIC_DEMO_MODE=true` for a fully interactive demo with no API key required.

---

## Features

### 🎧 Listening Module
1. **Settings** — choose target language, level (A1–B2), topic, and content type (dialogue, monologue, news, story, interview)
2. **AI content** — GPT-4o generates a natural transcript; OpenAI TTS reads it aloud
3. **Audio player** — progress bar, play/pause, restart; optional transcript overlay
4. **Comprehension quiz** — 5 multiple-choice questions auto-generated from the content
5. **Results** — score (e.g. 4/5), per-question answer review with correct answers highlighted

### 🎙️ Speaking Module
1. **Settings** — choose language, level, time limit (3 or 5 min), and conversation topic
2. **Recording** — single-device group recording; on-screen prompt: *"Place device between speakers"*
3. **SVG mascot** — animated character with live expressions during recording
4. **AI analysis** — Whisper transcribes the audio; GPT-4o scores grammar, vocabulary, fluency, and pronunciation
5. **Feedback** — overall score + numbered feedback points per category
6. **Optional quiz** — follow-up quiz generated from the conversation content
7. **Results** — full summary with retry option

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| AI — Content & Feedback | OpenAI GPT-4o |
| AI — Text-to-Speech | OpenAI TTS (tts-1, voice: nova) |
| AI — Transcription | OpenAI Whisper (whisper-1) |

---

## Local Setup

### 1. Clone & install

```bash
git clone https://github.com/Ryosuke-Kato/language-coach.git
cd language-coach
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

**Demo mode** (no API key needed):
```env
NEXT_PUBLIC_DEMO_MODE=true
```

**Real mode** (OpenAI API key required):
```env
NEXT_PUBLIC_DEMO_MODE=false
OPENAI_API_KEY=sk-...
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Mode

When `NEXT_PUBLIC_DEMO_MODE=true`, the app runs fully without calling OpenAI:

- **Listening** — returns a pre-written English coffee-shop dialogue with 5 comprehension questions. Audio plays a silent placeholder; read the transcript overlay.
- **Speaking** — skips real recording and returns a mock conversation transcript + GPT-style feedback on grammar, vocabulary, fluency, and pronunciation.

A yellow banner in both modules indicates demo mode is active.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | No | Set `true` to use mock responses (no API key needed) |
| `OPENAI_API_KEY` | Real mode only | Your OpenAI API key |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home / module selector
│   ├── listening/page.tsx          # Listening module (full state machine)
│   ├── speaking/page.tsx           # Speaking module (full state machine)
│   └── api/
│       ├── listening/generate/     # GPT-4o transcript + TTS audio
│       ├── listening/quiz/         # Comprehension quiz generation
│       ├── speaking/transcribe/    # Whisper transcription
│       └── speaking/feedback/      # GPT-4o language feedback
├── components/
│   ├── shared/                     # ModuleHeader, StepIndicator
│   ├── speaking/                   # RecordingCharacter SVG
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── mockData.ts                 # Demo mode responses
│   └── utils.ts
└── types/index.ts                  # Shared TypeScript types
```
