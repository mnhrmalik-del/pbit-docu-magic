import { useState } from "react";
import { FileText } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { ProcessingStatus, ProcessingStage } from "@/components/ProcessingStatus";
import { DownloadSection } from "@/components/DownloadSection";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [error, setError] = useState<string>();
  const [isDownloading, setIsDownloading] = useState<string>();
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setError(undefined);
    setStage("uploading");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload file
      const uploadResponse = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const result = await uploadResponse.json();
      
      // Simulate stage progression based on backend status
      // In production, you'd poll the backend or use websockets for real-time updates
      await simulateProcessing();
      
      setStage("complete");
      toast({
        title: "Success!",
        description: "Documentation generated successfully",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStage("error");
      toast({
        title: "Error",
        description: "Failed to process file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const simulateProcessing = async () => {
    // This simulates the stages - in production, you'd get real updates from your Flask backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStage("extracting");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStage("generating");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setStage("uploading-confluence");
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  const handleDownload = async (format: "pdf" | "docx") => {
    setIsDownloading(format);
    try {
      const response = await fetch(`http://localhost:5000/download/${format}`);
      
      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `documentation.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Downloaded!",
        description: `Documentation downloaded as ${format.toUpperCase()}`,
      });
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(undefined);
    }
  };

  const handleReset = () => {
    setStage("idle");
    setError(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            AI Documentation Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your .pbit file and let AI create comprehensive documentation
            with automatic Confluence integration
          </p>
        </div>

        {/* Main Content */}
        {stage === "idle" || stage === "error" ? (
          <FileUpload
            onFileSelect={handleFileSelect}
            isProcessing={false}
          />
        ) : (
          <>
            <ProcessingStatus stage={stage} error={error} />
            {stage === "complete" && (
              <>
                <DownloadSection
                  onDownload={handleDownload}
                  isDownloading={isDownloading}
                />
                <div className="text-center mt-6">
                  <button
                    onClick={handleReset}
                    className="text-sm text-primary hover:underline"
                  >
                    Process another file
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Info Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Automatic Extraction",
                description: "Extracts visuals and measures from your .pbit files",
              },
              {
                title: "AI Enhancement",
                description: "Uses CrewAI to generate comprehensive documentation",
              },
              {
                title: "Confluence Upload",
                description: "Automatically uploads to your Confluence workspace",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
