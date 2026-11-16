"use client";

import { useState, useRef, useEffect } from "react";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  XCircle,
  FlaskConical,
  ImageIcon,
  Tag,
  Upload,
  Loader2,
} from "lucide-react";

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

const LANGUAGES: Language[] = ["English", "French", "Spanish", "Japanese", "Mandarin", "Vietnamese"];
const LEVELS: Level[] = ["A1", "A2", "B1", "B2"];
const CONTENT_TYPES: ContentType[] = ["dialogue", "news", "story", "announce"];
const PRESET_TOPICS = [
  "Travel",
  "Food & Cooking",
  "Technology",
  "Sports",
  "Environment",
  "Health",
  "Music",
  "Daily Life",
  "History",
  "Science",
];

const STEPS = ["Settings", "Listen", "Quiz", "Results"];
const STEP_MAP: Record<ListeningStep, number> = {
  settings: 0,
  loading: 1,
  listening: 1,
  quiz: 2,
  results: 3,
};

type TopicMode = "keyword" | "image";

function dataUrlToBlobUrl(dataUrl: string): string {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  const blob = new Blob([u8arr], { type: mime });
  return URL.createObjectURL(blob);
}

export default function ListeningPage() {
  const [step, setStep] = useState<ListeningStep>("settings");
  const [settings, setSettings] = useState<ListeningSettings>({
    language: "French",
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

  // Topic mode state
  const [topicMode, setTopicMode] = useState<TopicMode>("keyword");
  const [useOtherKeyword, setUseOtherKeyword] = useState(false);
  const [otherKeywordValue, setOtherKeywordValue] = useState("");
  const [detectedTopics, setDetectedTopics] = useState<string[]>([]);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsAnalyzingImage(true);
    setDetectedTopics([]);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/listening/analyze-image", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      const topics: string[] = data.topics ?? [];
      setDetectedTopics(topics);
      if (topics.length > 0) setSettings((s) => ({ ...s, topic: topics[0] }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingImage(false);
    }
  }

  function setupAudio(url: string) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    let playUrl = url;
    if (url.startsWith("data:")) {
      playUrl = dataUrlToBlobUrl(url);
      blobUrlRef.current = playUrl;
    }

    const audio = new Audio(playUrl);
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
    audio.addEventListener("error", (e) => {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
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
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Playback failed:", err);
          setIsPlaying(false);
        });
    }
  }

  function handleRestart() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setProgress(0);
    setCurrentTime(0);
    audio.play()
      .then(() => setIsPlaying(true))
      .catch(console.error);
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
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }

  function handleSelectPresetTopic(topic: string) {
    setSettings((s) => ({ ...s, topic }));
    setUseOtherKeyword(false);
    setOtherKeywordValue("");
  }

  function handleSelectOther() {
    setUseOtherKeyword(true);
    setSettings((s) => ({ ...s, topic: otherKeywordValue }));
  }

  function handleOtherKeywordChange(value: string) {
    setOtherKeywordValue(value);
    setSettings((s) => ({ ...s, topic: value }));
  }

  function handleTopicModeChange(mode: TopicMode) {
    setTopicMode(mode);
    if (mode === "keyword") {
      setSettings((s) => ({ ...s, topic: "Travel" }));
      setUseOtherKeyword(false);
      setOtherKeywordValue("");
    } else {
      if (detectedTopics.length === 0) {
        setSettings((s) => ({ ...s, topic: "" }));
      }
    }
  }

  const isPresetSelected = !useOtherKeyword && PRESET_TOPICS.includes(settings.topic);

  return (
    <div className="flex flex-col min-h-screen">
      <ModuleHeader
        title="Listening"
        icon={<Headphones className="w-4 h-4 text-orange-500" />}
        accentColor="bg-orange-100"
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 sm:py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
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
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                <FlaskConical className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold">Demo mode</span> — pre-written
                  English content loads instantly. Add{" "}
                  <code className="bg-amber-100 px-1 rounded">OPENAI_API_KEY</code>{" "}
                  to generate real content in your selected language.
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold mb-1">Set up your session</h1>
              <p className="text-muted-foreground text-base">
                Choose what you want to practice today.
              </p>
            </div>

            <div className="grid gap-5">
              {/* Language */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Target Language</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSettings((s) => ({ ...s, language: lang }))}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                        settings.language === lang
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent active:bg-accent"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Level</Label>
                <div className="flex gap-3">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSettings((s) => ({ ...s, level }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors min-h-[52px] ${
                        settings.level === level
                          ? "bg-orange-400 text-white"
                          : "bg-muted hover:bg-accent active:bg-accent"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic — keyword or image */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Topic</Label>

                {/* Mode toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTopicModeChange("keyword")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                      topicMode === "keyword"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-accent active:bg-accent"
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    Keyword
                  </button>
                  <button
                    onClick={() => handleTopicModeChange("image")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                      topicMode === "image"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-accent active:bg-accent"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Image
                  </button>
                </div>

                {/* Keyword mode */}
                {topicMode === "keyword" && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {PRESET_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => handleSelectPresetTopic(topic)}
                          className={`px-4 py-2.5 rounded-xl text-sm transition-colors min-h-[44px] ${
                            isPresetSelected && settings.topic === topic
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-accent active:bg-accent"
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                      <button
                        onClick={handleSelectOther}
                        className={`px-4 py-2.5 rounded-xl text-sm transition-colors min-h-[44px] ${
                          useOtherKeyword
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-accent active:bg-accent"
                        }`}
                      >
                        Other
                      </button>
                    </div>
                    {useOtherKeyword && (
                      <input
                        autoFocus
                        type="text"
                        placeholder="Enter a topic or keyword…"
                        value={otherKeywordValue}
                        onChange={(e) => handleOtherKeywordChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    )}
                  </div>
                )}

                {/* Image mode */}
                {topicMode === "image" && (
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center gap-3 py-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors"
                    >
                      {imagePreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imagePreviewUrl}
                          alt="Uploaded"
                          className="max-h-32 rounded-lg object-contain"
                        />
                      ) : (
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {imagePreviewUrl ? "Tap to change image" : "Tap to upload an image"}
                      </span>
                    </button>

                    {isAnalyzingImage && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Identifying topics from image…
                      </div>
                    )}

                    {detectedTopics.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Detected topics — tap to select:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {detectedTopics.map((topic) => (
                            <button
                              key={topic}
                              onClick={() => setSettings((s) => ({ ...s, topic }))}
                              className={`px-4 py-2.5 rounded-xl text-sm transition-colors min-h-[44px] ${
                                settings.topic === topic
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted hover:bg-accent active:bg-accent"
                              }`}
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Active topic display */}
                {settings.topic && (
                  <p className="text-xs text-muted-foreground">
                    Selected topic:{" "}
                    <span className="font-medium text-foreground">{settings.topic}</span>
                  </p>
                )}
              </div>

              {/* Content Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Content Type</Label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSettings((s) => ({ ...s, contentType: type }))}
                      className={`px-4 py-2.5 rounded-xl text-sm capitalize transition-colors min-h-[44px] ${
                        settings.contentType === type
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent active:bg-accent"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!settings.topic}
              className="w-full h-14 text-base"
              size="lg"
            >
              Generate &amp; Listen
              <ChevronRight className="w-5 h-5 ml-1" />
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
              <CardContent className="pt-6 pb-6 space-y-5">
                {IS_DEMO && (
                  <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <FlaskConical className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Demo mode — content is pre-written in English regardless of
                      selected language. Add{" "}
                      <code className="bg-amber-100 px-0.5 rounded">OPENAI_API_KEY</code>{" "}
                      for real {settings.language} audio and transcript.
                    </span>
                  </div>
                )}

                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="w-20 h-20 rounded-full bg-orange-400 hover:bg-orange-500 active:bg-orange-600 flex items-center justify-center transition-colors shadow-lg"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </button>

                  <div className="text-center">
                    <span className="text-2xl font-bold tabular-nums">
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {" "}
                      / {formatTime(content.duration)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={progress} className="h-3 cursor-pointer" />
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted active:bg-muted transition-colors text-sm text-muted-foreground min-h-[44px]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restart
                  </button>
                </div>

                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="w-full text-sm text-primary hover:underline min-h-[44px] text-center"
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
              className="w-full h-14 text-base"
              size="lg"
            >
              Take the Quiz
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}

        {/* Quiz screen */}
        {step === "quiz" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Comprehension Quiz</h1>
              <p className="text-muted-foreground text-base">
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
                  <CardContent className="space-y-2.5">
                    {q.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(q.id, idx)}
                        className={`w-full text-left px-4 py-4 rounded-xl text-sm transition-colors border ${
                          userAnswers[q.id] === idx
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:bg-muted active:bg-muted border-transparent bg-muted/40"
                        }`}
                      >
                        <span className="font-semibold mr-2">
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
              className="w-full h-14 text-base"
              size="lg"
            >
              Submit Answers
              <ChevronRight className="w-5 h-5 ml-1" />
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
                    <CardContent className="pt-10 pb-10 text-center space-y-3">
                      <div className="text-7xl font-bold text-orange-400 tabular-nums">
                        {score}/{questions.length}
                      </div>
                      <div className="text-2xl font-semibold">
                        {pct >= 80
                          ? "Excellent! 🎉"
                          : pct >= 60
                          ? "Good Job! 👍"
                          : "Keep Practicing 💪"}
                      </div>
                      <p className="text-muted-foreground text-base">
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
                        <Card
                          key={q.id}
                          className={`border-l-4 ${
                            isCorrect ? "border-l-green-400" : "border-l-red-400"
                          }`}
                        >
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

                  <div className="flex gap-3 pb-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep("listening")}
                      className="flex-1 h-12"
                    >
                      Listen Again
                    </Button>
                    <Button onClick={handleRetry} className="flex-1 h-12">
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
