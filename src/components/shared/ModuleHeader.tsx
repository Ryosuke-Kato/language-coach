"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

interface ModuleHeaderProps {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
}

export function ModuleHeader({ title, icon, accentColor }: ModuleHeaderProps) {
  return (
    <header className="px-2 py-2 border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-muted active:bg-muted transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className={`w-8 h-8 rounded-lg ${accentColor} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <span className="font-semibold text-base">{title}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground pr-2">
          <BookOpen className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">LanguageCoach</span>
        </div>
      </div>
    </header>
  );
}
