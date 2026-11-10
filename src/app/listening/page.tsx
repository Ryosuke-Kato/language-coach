"use client";

import { useState, useRef, useEffect } from "react";
import { Headphones, Play, Pause, RotateCcw, ChevronRight, CheckCircle2, XCircle, FlaskConical } from "lucide-react";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { StepIndicator } from "@/components/shared/StepIndicator";
import type {
  Language,
  Level,
  ContentType,
  ListeningSettings,
  ListeningContent,
  QuizQuestion,
  ListeningStep,
} from "@/types";

const LANGUAGES: Language[] = ["English", "Spanish", "French", "German", "Japanese", "Korean", "Chinese", "Italian", "Portuguese"];
const LEVELS: Level[] = ["A1", "A2", "B1", "B2"];
const CONTENT_TYPES: ContentType[] = ["dialogue", "monologue", "news", "story", "interview"];
const TOPICS = ["Travel", "Food & Cooking", "Technology", "Sports", "Environment", "Health", "Music", "Daily Life", "History", "Science"];

const STEPS = ["Settings", "Listen", "Quiz", "Results"];
const STEP_MAP: Record<ListeningStep, number> = {
  settings: 0,
  loading: 1,
  listening: 1,
  quiz: 2,
  results: 3,
};

export default function ListeningPage() {
  const [step, setStep] = useState<ListeningStep>("settings");
  const [settings, setSettings] = useState<ListeningSettings>({
    language: "Spanish",
    level: "B1",
    topic: "Travel",
    contentType: "dialogue",
  });
  const [content, setContent] = useState<ListeningContent | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState("Generating content...");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  async function handleGenerate() {
    setStep("loading");
    setLoadingMsg("Generating transcript...");

    try {
      const res = await fetch("/api/listening/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setContent(data);

      setLoadingMsg("Generating quiz questions...");
      const qRes = await fetch("/api/listening/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: data.transcript,
          language: settings.language,
          level: settings.level,
        }),
      });
      if (!qRes.ok) throw new Error("Quiz failed");
      const qData = await qRes.json();
      setQuestions(qData.questions ?? []);
      setStep("listening");
    } catch (err) {
      console.error(err);
      setStep("settings");
      alert("Failed to generate content. Check your OPENAI_API_KEY.");
    }
  }

  function setupAudio(url: string) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(100);
    });
  }

  useEffect(() => {
    if (content?.audioUrl && step === "listening") {
      setupAudio(content.audioUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, step]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }

  function handleRestart() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setProgress(0);
    setCurrentTime(0);
    audio.play();
    setIsPlaying(true);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function handleAnswer(questionId: number, optionIndex: number) {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function calculateScore() {
    return questions.filter((q) => userAnswers[q.id] === q.correctIndex).length;
  }

  function handleRetry() {
    setStep("settings");
    setContent(null);
    setQuestions([]);
    setUserAnswers({});
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setShowTranscript(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ModuleHeader
        title="Listening"
        icon={<Headphones className="w-4 h-4 text-orange-500" />}
        accentColor="bg-orange-100"
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          <StepIndicator
            steps={STEPS}
            currentStep={STEP_MAP[step]}
            color="bg-orange-400"
          />
          <span className="text-sm text-muted-foreground">
            {STEPS[STEP_MAP[step]]}
          </span>
        </div>

        {/* Settings screen */}
        {step === "settings" && (
          <div className="space-y-6">
            {IS_DEMO && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                <FlaskConical className="w-4 h-4 flex-shrink-0" />
                <span><span className="font-semibold">Demo mode</span> — pre-written English content loads instantly. Add <code className="bg-amber-100 px-1 rounded">OPENAI_API_KEY</code> to generate real content.</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold mb-1">Set up your session</h1>
              <p className="text-muted-foreground">Choose what you want to practice today.</p>
            </div>

            <div className="grid gap-5">
              <div className="space-y-2">
                <Label>Target Language</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSettings((s) => ({ ...s, language: lang }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        settings.language === lang
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <div className="flex gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSettings((s) => ({ ...s, level }))}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        settings.level === level
                          ? "bg-orange-400 text-white"
                          : "bg-muted hover:bg-accent"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Topic</Label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setSettings((s) => ({ ...s, topic }))}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        settings.topic === topic
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content Type</Label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSettings((s) => ({ ...s, contentType: type }))}
                      className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                        settings.contentType === type
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={handleGenerate} className="w-full" size="lg">
              Generate &amp; Listen
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Loading screen */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
                <Headphones className="w-12 h-12 text-orange-400" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-400 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-lg">{loadingMsg}</p>
              <p className="text-muted-foreground text-sm">
                Creating your personalized {settings.language} content…
              </p>
            </div>
          </div>
        )}

        {/* Listening screen */}
        {step === "listening" && content && (
          <div className="space-y-6">
            <div>
              <Badge className="mb-3 bg-orange-100 text-orange-700 border-orange-200">
                {settings.contentType} · {settings.level} · {settings.language}
              </Badge>
              <h1 className="text-2xl font-bold">{content.title}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Listen carefully, then answer the comprehension questions.
              </p>
            </div>

            {/* Audio Player */}
            <Card className="overflow-hidden">
              <CardContent className="pt-6 space-y-4">
                {IS_DEMO && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Demo mode — the audio plays a silent placeholder. Read the transcript to follow along.</span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleRestart}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-orange-400 hover:bg-orange-500 flex items-center justify-center transition-colors shadow-lg"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 space-y-1">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(content.duration)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-sm text-primary hover:underline"
                >
                  {showTranscript ? "Hide" : "Show"} transcript
                </button>

                {showTranscript && (
                  <div className="bg-muted/50 rounded-xl p-4 text-sm leading-relaxed border">
                    {content.transcript}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={() => setStep("quiz")}
              className="w-full"
              size="lg"
            >
              Take the Quiz
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Quiz screen */}
        {step === "quiz" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Comprehension Quiz</h1>
              <p className="text-muted-foreground text-sm">
                {questions.length} questions · Choose the best answer for each.
              </p>
            </div>

            <div className="space-y-5">
              {questions.map((q) => (
                <Card key={q.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium leading-snug">
                      {q.id}. {q.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {q.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(q.id, idx)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors border ${
                          userAnswers[q.id] === idx
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-muted border-transparent"
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {opt}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={() => setStep("results")}
              disabled={Object.keys(userAnswers).length < questions.length}
              className="w-full"
              size="lg"
            >
              Submit Answers
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Results screen */}
        {step === "results" && (
          <div className="space-y-6">
            {(() => {
              const score = calculateScore();
              const pct = Math.round((score / questions.length) * 100);
              return (
                <>
                  <Card className="overflow-hidden">
                    <CardContent className="pt-8 pb-8 text-center space-y-3">
                      <div className="text-6xl font-bold text-orange-400">
                        {score}/{questions.length}
                      </div>
                      <div className="text-xl font-semibold">
                        {pct >= 80 ? "Excellent! 🎉" : pct >= 60 ? "Good Job! 👍" : "Keep Practicing 💪"}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {pct}% comprehension score
                      </p>
                      <Progress value={pct} className="h-3 mt-2" />
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <h2 className="font-semibold text-lg">Answer Review</h2>
                    {questions.map((q) => {
                      const userAns = userAnswers[q.id];
                      const correct = q.correctIndex;
                      const isCorrect = userAns === correct;
                      return (
                        <Card key={q.id} className={`border-l-4 ${isCorrect ? "border-l-green-400" : "border-l-red-400"}`}>
                          <CardContent className="pt-4 space-y-2">
                            <div className="flex items-start gap-2">
                              {isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                              )}
                              <p className="text-sm font-medium">{q.question}</p>
                            </div>
                            {!isCorrect && (
                              <div className="ml-7 space-y-1 text-sm">
                                <p className="text-red-500">
                                  Your answer: {q.options[userAns]}
                                </p>
                                <p className="text-green-600">
                                  Correct: {q.options[correct]}
                                </p>
                              </div>
                            )}
                            {isCorrect && (
                              <p className="ml-7 text-sm text-green-600">
                                {q.options[correct]}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep("listening")} className="flex-1">
                      Listen Again
                    </Button>
                    <Button onClick={handleRetry} className="flex-1">
                      New Session
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </main>
    </div>
  );
}
