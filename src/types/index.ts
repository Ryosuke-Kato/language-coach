export type Language = "English" | "Spanish" | "French" | "German" | "Japanese" | "Korean" | "Chinese" | "Italian" | "Portuguese";
export type Level = "A1" | "A2" | "B1" | "B2";
export type ContentType = "dialogue" | "monologue" | "news" | "story" | "interview";
export type TimeLimit = 3 | 5;

// Listening module types
export interface ListeningSettings {
  language: Language;
  level: Level;
  topic: string;
  contentType: ContentType;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ListeningContent {
  transcript: string;
  audioUrl: string;
  title: string;
  duration: number;
}

export type ListeningStep =
  | "settings"
  | "loading"
  | "listening"
  | "quiz"
  | "results";

// Speaking module types
export interface SpeakingSettings {
  language: Language;
  timeLimit: TimeLimit;
  topic: string;
}

export interface SpeakingFeedback {
  overallScore: number;
  points: FeedbackPoint[];
  summary: string;
}

export interface FeedbackPoint {
  category: "grammar" | "vocabulary" | "fluency" | "pronunciation";
  title: string;
  detail: string;
  positive: boolean;
}

export type SpeakingStep =
  | "settings"
  | "recording"
  | "processing"
  | "feedback"
  | "quiz"
  | "results";
