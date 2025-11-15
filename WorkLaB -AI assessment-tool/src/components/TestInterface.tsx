import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface TestInterfaceProps {
  paper: string;
  onSubmit: (answers: Record<string, string>) => void;
  isLoading: boolean;
}

export function TestInterface({ paper, onSubmit, isLoading }: TestInterfaceProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Parse questions from the paper (simplified - assumes numbered questions)
  const questions = paper.split(/\n\d+\.\s/).filter(q => q.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
  };

  return (
    <Card className="p-8 glass-card shadow-large">
      <div className="mb-6">
        <h2 className="text-3xl font-bold gradient-text mb-2">Attempt Your Test</h2>
        <p className="text-muted-foreground">Answer all questions to the best of your ability</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.map((question, index) => (
          <div key={index} className="space-y-4 p-6 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                {index + 1}
              </span>
              <div className="flex-1">
                <div className="prose prose-sm dark:prose-invert">
                  <ReactMarkdown>{question}</ReactMarkdown>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`answer-${index}`}>Your Answer</Label>
              <Textarea
                id={`answer-${index}`}
                placeholder="Type your answer here..."
                value={answers[`q${index}`] || ""}
                onChange={(e) => setAnswers({ ...answers, [`q${index}`]: e.target.value })}
                rows={4}
                required
              />
            </div>
          </div>
        ))}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Evaluating Your Answers...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Submit Test
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
