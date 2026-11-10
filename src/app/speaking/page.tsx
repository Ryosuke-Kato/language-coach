"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  Square,
  ChevronRight,
  CheckCircle2,
  Star,
  RefreshCw,
  FlaskConical,
} from "lucide-react";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { RecordingCharacter } from "@/components/speaking/RecordingCharacter";
import type {
  Language,
  Level,
  TimeLimit,
  SpeakingSettings,
  SpeakingFeedback,
  QuizQuestion,
  SpeakingStep,
} from "@/types";

const LANGUAGES: Language[] = ["English", "Spanish", "French", "German", "Japanese", "Korean", "Chinese", "Italian", "Portuguese"];
const LEVELS: Level[] = ["A1", "A2", "B1", "B2"];
const TIME_LIMITS: TimeLimit[] = [3, 5];
const TOPICS = [
  "What did you do last weekend?",
  "Describe your dream vacation.",
  "Talk about your hobbies and interests.",
  "What do you think about social media?",
  "Describe a memorable meal you've had.",
  "What would you do if you won the lottery?",
  "Talk about your favorite book or movie.",
  "Describe your ideal job.",
];

const STEPS = ["Settings", "Record", "Feedback", "Results"];
const STEP_MAP: Record<SpeakingStep, number> = {
  settings: 0,
  recording: 1,
  processing: 1,
  feedback: 2,
  quiz: 2,
  results: 3,
};

const CATEGORY_COLORS: Record<string, string> = {
  grammar: "bg-purple-100 text-purple-700 border-purple-200",
  vocabulary: "bg-blue-100 text-blue-700 border-blue-200",
  fluency: "bg-green-100 text-green-700 border-green-200",
  pronunciation: "bg-orange-100 text-orange-700 border-orange-200",
};

const CATEGORY_EMOJI: Record<string, string> = {
  grammar: "📝",
  vocabulary: "📚",
  fluency: "🌊",
  pronunciation: "🗣️",
};

export default function SpeakingPage() {
  const [step, setStep] = useState<SpeakingStep>("settings");
  const [settings, setSettings] = useState<SpeakingSettings>({
    language: "English",
    timeLimit: 3,
    topic: TOPICS[0],
  });
  const [level, setLevel] = useState<Level>("B1");
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [processingMsg, setProcessingMsg] = useState("Transcribing audio...");
  const [customTopic, setCustomTopic] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    if (isRecording) {
      const limit = settings.timeLimit * 60;
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= limit) {
            stopRecording();
            return limit;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, settings.timeLimit, stopRecording]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processRecording(blob);
      };

      mr.start(1000);
      setElapsed(0);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to record your conversation.");
    }
  }

  async function processRecording(blob: Blob) {
    setStep("processing");
    setProcessingMsg("Transcribing your conversation...");

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("language", settings.language);

      const tRes = await fetch("/api/speaking/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!tRes.ok) throw new Error("Transcription failed");
      const { transcript } = await tRes.json();

      setProcessingMsg("Analyzing your language skills...");

      const fRes = await fetch("/api/speaking/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          language: settings.language,
          level,
          topic: useCustom ? customTopic : settings.topic,
        }),
      });

      if (!fRes.ok) throw new Error("Feedback failed");
      const fData = await fRes.json();

      setFeedback({
        overallScore: fData.overallScore,
        summary: fData.summary,
        points: fData.points ?? [],
      });
      setQuizQuestions(fData.quizQuestions ?? []);
      setStep("feedback");
    } catch (err) {
      console.error(err);
      setStep("recording");
      setIsRecording(false);
      alert("Failed to process recording. Check your OPENAI_API_KEY.");
    }
  }

  function handleEndNow() {
    stopRecording();
  }

  async function handleDemoRecord() {
    setIsRecording(true);
    setElapsed(0);
    // Simulate a 3-second "recording" then jump straight to processing
    await new Promise((r) => setTimeout(r, 3000));
    setIsRecording(false);
    const dummyBlob = new Blob([], { type: "audio/webm" });
    await processRecording(dummyBlob);
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function timeRemaining() {
    return settings.timeLimit * 60 - elapsed;
  }

  function handleAnswer(questionId: number, optionIndex: number) {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function calculateScore() {
    return quizQuestions.filter((q) => userAnswers[q.id] === q.correctIndex).length;
  }

  function handleRetry() {
    setStep("settings");
    setFeedback(null);
    setQuizQuestions([]);
    setUserAnswers({});
    setShowQuiz(false);
    setElapsed(0);
    setIsRecording(false);
  }

  const topic = useCustom ? customTopic : settings.topic;
  const totalTime = settings.timeLimit * 60;
  const progressPct = (elapsed / totalTime) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      <ModuleHeader
        title="Speaking"
        icon={<Mic className="w-4 h-4 text-blue-500" />}
        accentColor="bg-blue-100"
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          <StepIndicator
            steps={STEPS}
            currentStep={STEP_MAP[step]}
            color="bg-blue-400"
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
                <span><span className="font-semibold">Demo mode</span> — recording is skipped; a mock transcript &amp; feedback loads automatically. Add <code className="bg-amber-100 px-1 rounded">OPENAI_API_KEY</code> for real analysis.</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold mb-1">Set up your session</h1>
              <p className="text-muted-foreground">
                Choose a topic and start chatting with a partner. We&apos;ll analyze your conversation.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="space-y-2">
                <Label>Language you are speaking</Label>
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
                <Label>Your Level</Label>
                <div className="flex gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        level === l
                          ? "bg-blue-400 text-white"
                          : "bg-muted hover:bg-accent"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Time Limit</Label>
                <div className="flex gap-3">
                  {TIME_LIMITS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSettings((s) => ({ ...s, timeLimit: t }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        settings.timeLimit === t
                          ? "bg-blue-400 text-white"
                          : "bg-muted hover:bg-accent"
                      }`}
                    >
                      {t} minutes
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Conversation Topic</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setSettings((s) => ({ ...s, topic: t })); setUseCustom(false); }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors text-left ${
                        settings.topic === t && !useCustom
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Or type a custom topic..."
                    value={customTopic}
                    onChange={(e) => { setCustomTopic(e.target.value); setUseCustom(true); }}
                    onFocus={() => setUseCustom(true)}
                    className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-700">
              <p className="font-medium mb-1">💬 How it works</p>
              <p>Gather around one device with your conversation partners. Place it between you, tap Record, and have a natural conversation. AI will transcribe and analyze everyone&apos;s speaking.</p>
            </div>

            <Button
              onClick={() => setStep("recording")}
              className="w-full bg-blue-500 hover:bg-blue-600"
              size="lg"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start to Chat
            </Button>
          </div>
        )}

        {/* Recording screen */}
        {step === "recording" && (
          <div className="flex flex-col items-center space-y-7">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold">
                {isRecording ? "Conversation in Progress" : "Get Ready to Speak"}
              </h1>
              <p className="text-muted-foreground text-sm">
                Topic: <span className="font-medium text-foreground">&ldquo;{topic}&rdquo;</span>
              </p>
            </div>

            {/* Setup instruction banner — only shown before recording starts */}
            {!isRecording && (
              <div className="w-full p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3 text-sm text-blue-800">
                <span className="text-xl mt-0.5">📱</span>
                <div>
                  <p className="font-semibold mb-0.5">One device, all speakers</p>
                  <p>Place this device <span className="font-medium">between all speakers</span> so everyone's voice is picked up. When you're ready, tap <span className="font-medium">Start Recording</span>.</p>
                </div>
              </div>
            )}

            {/* Character */}
            <RecordingCharacter isRecording={isRecording} />

            {/* Timer */}
            {isRecording && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Elapsed: {formatTime(elapsed)}</span>
                  <span className={`font-medium ${timeRemaining() < 30 ? "text-red-500" : "text-muted-foreground"}`}>
                    Remaining: {formatTime(timeRemaining())}
                  </span>
                </div>
                <Progress value={progressPct} className="h-3" />
              </div>
            )}

            {/* Recording pulse indicator */}
            {isRecording && (
              <div className="flex items-center gap-2 text-red-500">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium">Recording — speak naturally!</span>
              </div>
            )}

            {!isRecording ? (
              <Button
                onClick={IS_DEMO ? handleDemoRecord : startRecording}
                size="lg"
                className="w-full max-w-xs bg-red-500 hover:bg-red-600 text-white"
              >
                <Mic className="w-5 h-5 mr-2" />
                {IS_DEMO ? "Simulate Recording" : "Start Recording"}
              </Button>
            ) : (
              <Button
                onClick={handleEndNow}
                size="lg"
                variant="outline"
                className="w-full max-w-xs border-red-200 text-red-600 hover:bg-red-50"
              >
                <Square className="w-4 h-4 mr-2" />
                End Now
              </Button>
            )}
          </div>
        )}

        {/* Processing screen */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <Mic className="w-12 h-12 text-blue-400" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-400 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-lg">{processingMsg}</p>
              <p className="text-muted-foreground text-sm">
                Analyzing your {settings.language} conversation…
              </p>
            </div>
          </div>
        )}

        {/* Feedback screen */}
        {step === "feedback" && feedback && !showQuiz && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-5xl">🌟</div>
              <h1 className="text-2xl font-bold">Great Conversation!</h1>
              <p className="text-muted-foreground">{feedback.summary}</p>
            </div>

            {/* Score */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Overall Score</span>
                  <span className="text-2xl font-bold text-blue-500">{feedback.overallScore}/100</span>
                </div>
                <Progress value={feedback.overallScore} className="h-3" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Needs Work</span>
                  <span>Excellent</span>
                </div>
              </CardContent>
            </Card>

            {/* Feedback points */}
            <div className="space-y-3">
              <h2 className="font-semibold text-lg">Detailed Feedback</h2>
              {feedback.points.map((point, i) => (
                <Card key={i} className={`border-l-4 ${point.positive ? "border-l-green-400" : "border-l-amber-400"}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{CATEGORY_EMOJI[point.category]}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{point.title}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${CATEGORY_COLORS[point.category]}`}
                          >
                            {point.category}
                          </Badge>
                          {point.positive ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                          ) : (
                            <Star className="w-4 h-4 text-amber-400 ml-auto" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{point.detail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              {quizQuestions.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowQuiz(true)}
                  className="flex-1"
                >
                  Take Quiz
                </Button>
              )}
              <Button
                onClick={() => setStep("results")}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                See Results
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Quiz screen (follow-up) */}
        {step === "feedback" && showQuiz && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Follow-up Quiz</h1>
              <p className="text-muted-foreground text-sm">
                Based on your conversation — test what you know!
              </p>
            </div>

            <div className="space-y-5">
              {quizQuestions.map((q) => (
                <Card key={q.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
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
                            ? "bg-blue-500 text-white border-blue-500"
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
              disabled={Object.keys(userAnswers).length < quizQuestions.length}
              className="w-full bg-blue-500 hover:bg-blue-600"
              size="lg"
            >
              See Final Results
            </Button>
          </div>
        )}

        {/* Results screen */}
        {step === "results" && feedback && (
          <div className="space-y-6">
            <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-8 pb-8 text-center space-y-4">
                <div className="text-5xl">🎊</div>
                <h1 className="text-2xl font-bold">Session Complete!</h1>
                <div className="text-5xl font-bold text-blue-500">
                  {feedback.overallScore}
                  <span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <p className="text-muted-foreground">{feedback.summary}</p>

                {showQuiz && quizQuestions.length > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-white/70 border border-blue-200">
                    <p className="text-sm font-medium">
                      Quiz Score: {calculateScore()}/{quizQuestions.length}
                    </p>
                    <Progress
                      value={(calculateScore() / quizQuestions.length) * 100}
                      className="h-2 mt-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Score breakdown */}
            <div className="grid grid-cols-2 gap-3">
              {(["grammar", "vocabulary", "fluency", "pronunciation"] as const).map((cat) => {
                const pts = feedback.points.filter((p) => p.category === cat);
                const positiveCount = pts.filter((p) => p.positive).length;
                return (
                  <div
                    key={cat}
                    className={`p-4 rounded-xl border capitalize ${CATEGORY_COLORS[cat]}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{CATEGORY_EMOJI[cat]}</span>
                      <span className="text-xs font-semibold">{cat}</span>
                    </div>
                    <p className="text-xs opacity-75">
                      {positiveCount}/{pts.length} positive
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRetry} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => setStep("feedback")}
                variant="outline"
                className="flex-1"
              >
                View Feedback
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
