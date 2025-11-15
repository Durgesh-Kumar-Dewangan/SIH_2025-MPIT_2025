import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, TrendingUp, Target, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface PerformanceDashboardProps {
  result: {
    score: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    feedback: string;
  };
  onRetake: () => void;
}

export function PerformanceDashboard({ result, onRetake }: PerformanceDashboardProps) {
  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      'A+': 'text-success',
      'A': 'text-success',
      'B': 'text-secondary',
      'C': 'text-accent',
      'D': 'text-destructive',
      'F': 'text-destructive',
    };
    return colors[grade] || 'text-foreground';
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 glass-card shadow-large text-center">
        <Award className="h-16 w-16 mx-auto mb-4 text-primary animate-float" />
        <h2 className="text-4xl font-bold gradient-text mb-2">Test Results</h2>
        <p className="text-muted-foreground">Your performance summary</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 glass-card shadow-medium text-center">
          <Target className="h-8 w-8 mx-auto mb-3 text-primary" />
          <div className="text-3xl font-bold mb-1">
            {result.score}/{result.totalMarks}
          </div>
          <div className="text-sm text-muted-foreground">Marks Obtained</div>
        </Card>

        <Card className="p-6 glass-card shadow-medium text-center">
          <TrendingUp className="h-8 w-8 mx-auto mb-3 text-secondary" />
          <div className="text-3xl font-bold mb-1">
            {result.percentage.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Percentage</div>
        </Card>

        <Card className="p-6 glass-card shadow-medium text-center">
          <Award className="h-8 w-8 mx-auto mb-3 text-accent" />
          <div className={`text-3xl font-bold mb-1 ${getGradeColor(result.grade)}`}>
            {result.grade}
          </div>
          <div className="text-sm text-muted-foreground">Grade</div>
        </Card>
      </div>

      <Card className="p-8 glass-card shadow-large">
        <h3 className="text-2xl font-bold gradient-text-accent mb-4">Performance Feedback</h3>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown>{result.feedback}</ReactMarkdown>
        </div>
      </Card>

      <Button
        onClick={onRetake}
        className="w-full bg-gradient-accent hover:shadow-glow transition-all"
        size="lg"
      >
        <RotateCcw className="mr-2 h-5 w-5" />
        Generate New Test
      </Button>
    </div>
  );
}
