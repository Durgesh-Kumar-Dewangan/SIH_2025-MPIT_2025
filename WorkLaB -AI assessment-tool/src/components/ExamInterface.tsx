import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Clock, ChevronLeft, ChevronRight, Send, Upload } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Question {
  id: string;
  topic: string;
  question: string;
  marks: number;
}

interface ExamInterfaceProps {
  subject?: string;
  questions: Question[];
  totalTime: number; // in minutes
  onSubmit: (answers: Record<string, { text: string; file?: File }>) => void;
  isLoading: boolean;
}

export function ExamInterface({ subject, questions, totalTime, onSubmit, isLoading }: ExamInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { text: string; file?: File }>>({});
  const [timeLeft, setTimeLeft] = useState(totalTime * 60); // convert to seconds
  const [files, setFiles] = useState<Record<string, File>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning("Time's up! Submitting exam...");
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { text, file: prev[questionId]?.file },
    }));
  };

  const handleFileUpload = (questionId: string, file: File) => {
    setFiles((prev) => ({ ...prev, [questionId]: file }));
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { text: prev[questionId]?.text || "", file },
    }));
    toast.success("File uploaded successfully");
  };

  const handleSubmit = () => {
    const unanswered = questions.filter(
      (q) => !answers[q.id]?.text && !answers[q.id]?.file
    );
    
    if (unanswered.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    onSubmit(answers);
  };

  return (
    <Card className="p-6 shadow-large">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">{subject ? `${subject} ` : ''}Assessment in Progress</h2>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
            <Clock className="h-5 w-5 text-primary" />
            <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <div className="mb-6 p-6 rounded-lg border border-border bg-muted/30">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
            {currentIndex + 1}
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1">
              Topic: {currentQuestion.topic} • Marks: {currentQuestion.marks}
            </div>
            <div className="prose prose-sm dark:prose-invert">
              <ReactMarkdown>{currentQuestion.question}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Input */}
      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor={`answer-${currentQuestion.id}`}>Your Answer</Label>
          <Textarea
            id={`answer-${currentQuestion.id}`}
            placeholder="Type your answer here..."
            value={answers[currentQuestion.id]?.text || ""}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`file-${currentQuestion.id}`}>Or Upload Answer (Optional)</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`file-${currentQuestion.id}`}
              type="file"
              accept=".pdf,.txt,.doc,.docx,.jpg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(currentQuestion.id, file);
              }}
              className="flex-1"
            />
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          {files[currentQuestion.id] && (
            <p className="text-xs text-primary">
              Uploaded: {files[currentQuestion.id].name}
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentIndex(currentIndex + 1)}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-primary"
            >
              {isLoading ? (
                "Evaluating..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Exam
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigation Dots */}
      <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(idx)}
            className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
              idx === currentIndex
                ? "bg-primary text-white"
                : answers[q.id]?.text || answers[q.id]?.file
                ? "bg-success text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </Card>
  );
}
