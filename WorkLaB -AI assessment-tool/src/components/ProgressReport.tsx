import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Award, Download, TrendingUp, Target, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface QuestionResult {
  question: string;
  topic: string;
  marks: number;
  userAnswer: string;
  score: number;
  feedback: string;
  modelAnswer?: string;
}

interface ProgressReportProps {
  results: {
    totalScore: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    overallFeedback: string;
    questionResults: QuestionResult[];
    strengths: string[];
    weaknesses: string[];
  };
  onRetake: () => void;
}

export function ProgressReport({ results, onRetake }: ProgressReportProps) {
  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      "A+": "text-success",
      A: "text-success",
      B: "text-primary",
      C: "text-accent",
      D: "text-destructive",
      F: "text-destructive",
    };
    return colors[grade] || "text-foreground";
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(33, 110, 243);
      doc.text("Assessment Progress Report", 20, yPos);
      yPos += 15;

      // Summary
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Score: ${results.totalScore}/${results.totalMarks}`, 20, yPos);
      yPos += 7;
      doc.text(`Percentage: ${results.percentage.toFixed(1)}%`, 20, yPos);
      yPos += 7;
      doc.text(`Grade: ${results.grade}`, 20, yPos);
      yPos += 15;

      // Strengths
      doc.setFontSize(14);
      doc.setTextColor(33, 110, 243);
      doc.text("Strengths:", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      results.strengths.forEach((strength) => {
        const lines = doc.splitTextToSize(`• ${strength}`, 170);
        lines.forEach((line: string) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, 25, yPos);
          yPos += 5;
        });
      });
      yPos += 10;

      // Weaknesses
      doc.setFontSize(14);
      doc.setTextColor(239, 68, 68);
      doc.text("Areas for Improvement:", 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      results.weaknesses.forEach((weakness) => {
        const lines = doc.splitTextToSize(`• ${weakness}`, 170);
        lines.forEach((line: string) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, 25, yPos);
          yPos += 5;
        });
      });

      // Question-wise results
      doc.addPage();
      yPos = 20;
      doc.setFontSize(16);
      doc.setTextColor(33, 110, 243);
      doc.text("Question-wise Analysis", 20, yPos);
      yPos += 10;

      results.questionResults.forEach((result, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Q${index + 1}. ${result.topic} (${result.score}/${result.marks} marks)`, 20, yPos);
        yPos += 7;

        doc.setFontSize(10);
        const qLines = doc.splitTextToSize(result.question, 170);
        qLines.forEach((line: string) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, 20, yPos);
          yPos += 5;
        });

        yPos += 3;
        doc.setTextColor(100, 100, 100);
        doc.text("Your Answer:", 20, yPos);
        yPos += 5;
        const aLines = doc.splitTextToSize(result.userAnswer || "Not answered", 165);
        aLines.forEach((line: string) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, 25, yPos);
          yPos += 5;
        });

        if (result.modelAnswer) {
          yPos += 3;
          doc.setTextColor(34, 197, 94);
          doc.text("Model Answer (Learn from this):", 20, yPos);
          yPos += 5;
          doc.setTextColor(0, 0, 0);
          const mLines = doc.splitTextToSize(result.modelAnswer, 165);
          mLines.forEach((line: string) => {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, 25, yPos);
            yPos += 5;
          });
        }

        yPos += 3;
        doc.setTextColor(33, 110, 243);
        doc.text("Feedback:", 20, yPos);
        yPos += 5;
        doc.setTextColor(0, 0, 0);
        const fLines = doc.splitTextToSize(result.feedback, 165);
        fLines.forEach((line: string) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, 25, yPos);
          yPos += 5;
        });

        yPos += 8;
      });

      doc.save("progress-report.pdf");
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 shadow-soft text-center">
          <Target className="h-10 w-10 mx-auto mb-3 text-primary" />
          <div className="text-3xl font-bold mb-1">
            {results.totalScore}/{results.totalMarks}
          </div>
          <div className="text-sm text-muted-foreground">Total Marks</div>
        </Card>

        <Card className="p-6 shadow-soft text-center">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 text-secondary" />
          <div className="text-3xl font-bold mb-1">
            {results.percentage.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Percentage</div>
        </Card>

        <Card className="p-6 shadow-soft text-center">
          <Award className="h-10 w-10 mx-auto mb-3 text-accent" />
          <div className={`text-3xl font-bold mb-1 ${getGradeColor(results.grade)}`}>
            {results.grade}
          </div>
          <div className="text-sm text-muted-foreground">Grade</div>
        </Card>
      </div>

      {/* Overall Feedback */}
      <Card className="p-6 shadow-medium">
        <h3 className="text-xl font-bold mb-4">Overall Performance</h3>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{results.overallFeedback}</ReactMarkdown>
        </div>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-soft">
          <h3 className="text-lg font-semibold mb-3 text-success">Strengths</h3>
          <ul className="space-y-2">
            {results.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span className="text-sm">{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 shadow-soft">
          <h3 className="text-lg font-semibold mb-3 text-destructive">
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {results.weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-destructive mt-1">→</span>
                <span className="text-sm">{weakness}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Question-wise Results */}
      <Card className="p-6 shadow-medium">
        <h3 className="text-xl font-bold mb-4">Question-wise Analysis</h3>
        <div className="space-y-6">
          {results.questionResults.map((result, idx) => (
            <div key={idx} className="border-l-4 border-primary pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">
                  Q{idx + 1}. {result.topic}
                </h4>
                <span className="text-sm font-medium">
                  {result.score}/{result.marks} marks
                </span>
              </div>
              <div className="prose prose-sm dark:prose-invert mb-2">
                <ReactMarkdown>{result.question}</ReactMarkdown>
              </div>
              <div className="text-sm text-muted-foreground mb-2 bg-muted/30 p-3 rounded">
                <strong>Your Answer:</strong> {result.userAnswer || "Not answered"}
              </div>
              {result.modelAnswer && (
                <div className="text-sm bg-success/10 border border-success/30 p-3 rounded mb-2">
                  <strong className="text-success">Model Answer (Learn from this):</strong>
                  <div className="mt-2 prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{result.modelAnswer}</ReactMarkdown>
                  </div>
                </div>
              )}
              <div className="text-sm bg-primary/10 border border-primary/30 p-3 rounded">
                <strong className="text-primary">Feedback:</strong>
                <div className="mt-1">
                  {result.feedback}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={downloadPDF} variant="outline" className="flex-1">
          <Download className="mr-2 h-5 w-5" />
          Download PDF Report
        </Button>
        <Button onClick={onRetake} className="flex-1 bg-gradient-primary">
          <RefreshCw className="mr-2 h-5 w-5" />
          Start New Assessment
        </Button>
      </div>
    </div>
  );
}
