# LanguageCoach 🎓

An AI-powered language learning web app for A2→B2 learners. Practice listening comprehension and speaking skills with personalized AI-generated content, real-time feedback, and comprehension quizzes.

## Features

### 🎧 Listening Module
- Choose language, level (A1–B2), topic, and content type
- AI generates a custom transcript (dialogue, monologue, news, story, interview)
- OpenAI TTS reads the content aloud with a progress bar
- 5-question comprehension quiz auto-generated from the content
- Detailed result review with correct vs. user answers

### 🎙️ Speaking Module
- Choose language, level, time limit (3 or 5 minutes), and conversation topic
- Record your conversation with a partner
- AI (Whisper) transcribes the recording
- GPT-4o analyzes grammar, vocabulary, fluency, and pronunciation
- Overall score + numbered feedback points
- Optional follow-up quiz based on the conversation
- Full results screen with retry option

## Tech Stack
- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui
- **OpenAI** GPT-4o, TTS (tts-1), Whisper

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-...
   ```
4. Run the dev server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key (required) |
