import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload = ({ onFileSelect, isProcessing }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    if (!file.name.endsWith(".pbit")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .pbit file",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 ${
          dragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border bg-card hover:border-primary/50"
        } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pbit"
          onChange={handleChange}
          disabled={isProcessing}
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground mb-1">
                Drop your .pbit file here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>
            <Button onClick={handleButtonClick} disabled={isProcessing}>
              Select File
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 animate-scale-in">
            <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg w-full max-w-md">
              <div className="p-2 rounded bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isProcessing}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={handleUpload}
              size="lg"
              disabled={isProcessing}
              className="min-w-[200px]"
            >
              Start Processing
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
