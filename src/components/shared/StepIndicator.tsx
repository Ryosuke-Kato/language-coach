"use client";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  color?: string;
}

export function StepIndicator({
  steps,
  currentStep,
  color = "bg-primary",
}: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i <= currentStep
              ? `${color} ${i === currentStep ? "w-6" : "w-3"}`
              : "bg-border w-3"
          }`}
        />
      ))}
    </div>
  );
}
