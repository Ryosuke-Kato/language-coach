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
    <header className="px-6 py-4 border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className={`w-8 h-8 rounded-lg ${accentColor} flex items-center justify-center`}>
            {icon}
          </div>
          <span className="font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>LanguageCoach</span>
        </div>
      </div>
    </header>
  );
}
