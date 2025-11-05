import { Download, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DownloadSectionProps {
  onDownload: (format: "pdf" | "docx") => void;
  isDownloading?: string;
}

export const DownloadSection = ({
  onDownload,
  isDownloading,
}: DownloadSectionProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-slide-up">
      <Card className="p-6 border-success/20 bg-success/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-success/10">
            <CheckCircle2 className="w-6 h-6 text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Documentation Ready!
            </h3>
            <p className="text-sm text-muted-foreground">
              Download your generated documentation below
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={() => onDownload("pdf")}
            disabled={isDownloading === "pdf"}
            variant="outline"
            size="lg"
            className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary"
          >
            {isDownloading === "pdf" ? (
              <>
                <Download className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-medium">Downloading PDF...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Download as PDF</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => onDownload("docx")}
            disabled={isDownloading === "docx"}
            variant="outline"
            size="lg"
            className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary"
          >
            {isDownloading === "docx" ? (
              <>
                <Download className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-medium">Downloading DOCX...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Download as DOCX</span>
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Files will be automatically cleaned up after download
        </p>
      </Card>
    </div>
  );
};
