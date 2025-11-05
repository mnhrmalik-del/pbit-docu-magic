import { CheckCircle2, Loader2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export type ProcessingStage =
  | "idle"
  | "uploading"
  | "extracting"
  | "generating"
  | "uploading-confluence"
  | "complete"
  | "error";

interface ProcessingStatusProps {
  stage: ProcessingStage;
  error?: string;
}

const stages = [
  { id: "uploading", label: "Uploading File" },
  { id: "extracting", label: "Extracting Metadata" },
  { id: "generating", label: "Generating Documentation" },
  { id: "uploading-confluence", label: "Uploading to Confluence" },
  { id: "complete", label: "Complete" },
];

const getStageIndex = (stage: ProcessingStage): number => {
  const index = stages.findIndex((s) => s.id === stage);
  return index === -1 ? 0 : index;
};

const getProgress = (stage: ProcessingStage): number => {
  const index = getStageIndex(stage);
  return ((index + 1) / stages.length) * 100;
};

export const ProcessingStatus = ({ stage, error }: ProcessingStatusProps) => {
  if (stage === "idle") return null;

  const currentIndex = getStageIndex(stage);
  const progress = getProgress(stage);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-slide-up">
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {error ? (
          <div className="text-center">
            <div className="inline-flex p-3 rounded-full bg-destructive/10 mb-4">
              <X className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Processing Failed
            </h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">
                  {stage === "complete"
                    ? "Processing Complete!"
                    : stages[currentIndex]?.label || "Processing..."}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-3">
              {stages.map((stageItem, index) => {
                const isComplete = index < currentIndex || stage === "complete";
                const isCurrent = index === currentIndex && stage !== "complete";

                return (
                  <div
                    key={stageItem.id}
                    className={`flex items-center gap-3 transition-all duration-300 ${
                      isComplete || isCurrent ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    {isComplete ? (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-success-foreground" />
                      </div>
                    ) : isCurrent ? (
                      <Loader2 className="flex-shrink-0 w-5 h-5 text-primary animate-spin" />
                    ) : (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-border" />
                    )}
                    <span
                      className={`text-sm ${
                        isComplete || isCurrent
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stageItem.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
