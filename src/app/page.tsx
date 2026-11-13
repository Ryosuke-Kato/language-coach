import Link from "next/link";
import { Headphones, Mic, ArrowRight, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 py-4 border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-tight">LanguageCoach</span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col px-4 py-8 sm:py-16 sm:items-center sm:justify-center sm:text-center">
        <div className="w-full max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium self-start sm:self-auto">
            <span>🎓</span>
            <span>A2 → B2 Language Learning</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Learn languages with
            <span className="text-primary"> AI-powered</span> coaching
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Sharpen your listening comprehension and speaking skills with
            personalized AI content, instant feedback, and smart quizzes.
          </p>

          {/* Module Cards */}
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 mt-6 text-left">
            <Link href="/listening" className="group block">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 active:scale-[0.98] hover:shadow-lg hover:border-primary/30 transition-all duration-200 sm:hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shrink-0">
                  <Headphones className="w-7 h-7 text-orange-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Listening</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  AI generates content in your target language. Listen, then
                  test your comprehension with auto-generated quizzes.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["Dialogue", "Monologue", "News", "Story"].map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                  Start listening
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/speaking" className="group block">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 active:scale-[0.98] hover:shadow-lg hover:border-primary/30 transition-all duration-200 sm:hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shrink-0">
                  <Mic className="w-7 h-7 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Speaking</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Record your conversation, then get AI feedback on grammar,
                  vocabulary, fluency, and pronunciation.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["3 min", "5 min", "Grammar", "Fluency"].map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                  Start speaking
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 px-4 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p>Powered by OpenAI GPT-4o, TTS &amp; Whisper</p>
      </footer>
    </main>
  );
}
