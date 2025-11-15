import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Upload, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SyllabusUploadProps {
  onSyllabusAnalyzed: (data: any) => void;
}

export function SyllabusUpload({ onSyllabusAnalyzed }: SyllabusUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [numQuestions, setNumQuestions] = useState("10");
  const [difficulty, setDifficulty] = useState("medium");
  const [provider, setProvider] = useState<"gemini" | "openai">("gemini");
  const [timeLimit, setTimeLimit] = useState("30");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Please upload a PDF, TXT, DOC, or DOCX file");
        return;
      }
      
      setFile(selectedFile);
      toast.success("File selected successfully");
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please upload a syllabus file");
      return;
    }

    if (!subject.trim()) {
      toast.error("Please enter a subject title");
      return;
    }

    setIsLoading(true);
    try {
      // Read file content
      let fileContent = "";
      
      if (file.type === "text/plain") {
        fileContent = await file.text();
      } else if (file.type === "application/pdf" || file.type.includes("word")) {
        // For PDF and Word docs, we'll send the file and parse it on the backend
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            resolve(base64.split(",")[1]);
          };
          reader.readAsDataURL(file);
        });
        const base64Content = await base64Promise;
        fileContent = base64Content;
      }

      // Call edge function to analyze syllabus and generate questions
      const { data, error } = await supabase.functions.invoke("analyze-syllabus", {
        body: {
          fileContent,
          fileName: file.name,
          fileType: file.type,
          subject: subject.trim(),
          numQuestions: parseInt(numQuestions),
          difficulty,
          provider,
          timeLimit: parseInt(timeLimit),
        },
      });

      if (error) throw error;

      toast.success("Syllabus analyzed successfully!");
      onSyllabusAnalyzed(data);
    } catch (error: any) {
      console.error("Error analyzing syllabus:", error);
      toast.error(error.message || "Failed to analyze syllabus");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Upload Syllabus</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject-title">Subject Title</Label>
          <Input
            id="subject-title"
            type="text"
            placeholder="e.g., Mathematics, Physics, Computer Science"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="syllabus-file">Syllabus File</Label>
          <Input
            id="syllabus-file"
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            Accepted formats: PDF, TXT, DOC, DOCX
          </p>
          {file && (
            <p className="text-sm text-primary font-medium">
              Selected: {file.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-provider">AI Provider</Label>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${provider === "gemini" ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                Gemini
              </span>
              <Switch
                id="ai-provider"
                checked={provider === "openai"}
                onCheckedChange={(checked) => setProvider(checked ? "openai" : "gemini")}
              />
              <span className={`text-sm ${provider === "openai" ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                ChatGPT
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="num-questions">Number of Questions</Label>
            <Input
              id="num-questions"
              type="number"
              min="1"
              max="50"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time-limit">Time Limit (minutes)</Label>
          <Select value={timeLimit} onValueChange={setTimeLimit}>
            <SelectTrigger id="time-limit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
              <SelectItem value="180">3 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!file || !subject.trim() || isLoading}
          className="w-full bg-gradient-primary"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Syllabus...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Analyze & Generate Questions
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
