import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <ol className="flex flex-col gap-1.5">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <li key={step} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-sm border text-xs font-semibold",
                  isComplete
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="relative ml-[15px] h-4 w-px bg-border sm:h-9 lg:h-12">
                <div
                  className={cn(
                    "absolute left-0 top-0 w-px bg-primary transition-all duration-300 ease-in-out",
                    isComplete ? "h-full" : "h-0",
                  )}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
