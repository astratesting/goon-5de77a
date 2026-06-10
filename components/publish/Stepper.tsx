"use client";

import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="flex items-center gap-2 w-full">
      {steps.map((step, i) => {
        const isComplete = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isClickable = isComplete && onStepClick;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <button
              onClick={isClickable ? () => onStepClick(step.id) : undefined}
              disabled={!isClickable}
              className={`flex items-center gap-2 shrink-0 ${
                isClickable ? "cursor-pointer hover:opacity-80" : ""
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                  isComplete
                    ? "bg-teal text-ink"
                    : isCurrent
                    ? "bg-indigo text-white"
                    : "bg-ink-3 text-text-faint border border-border"
                }`}
              >
                {isComplete ? <Check size={14} /> : step.id}
              </div>
              <span
                className={`text-sm whitespace-nowrap ${
                  isCurrent ? "text-text font-medium" : isComplete ? "text-teal" : "text-text-faint"
                }`}
              >
                {step.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className="flex-1 mx-3 h-px bg-border" />
            )}
          </div>
        );
      })}
    </div>
  );
}
