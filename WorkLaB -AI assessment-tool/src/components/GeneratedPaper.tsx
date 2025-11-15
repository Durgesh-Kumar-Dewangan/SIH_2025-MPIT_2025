import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileCheck, Download, PlayCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface GeneratedPaperProps {
  paper: string;
  onStartTest: () => void;
  onGenerateSolutions?: () => void;
}

export function GeneratedPaper({ paper, onStartTest, onGenerateSolutions }: GeneratedPaperProps) {
  return (
    <Card className="p-8 glass-card shadow-large">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Generated Question Paper</h2>
          <p className="text-muted-foreground">Review your custom generated test</p>
        </div>
        <FileCheck className="h-12 w-12 text-primary animate-float" />
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
        <ReactMarkdown>{paper}</ReactMarkdown>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onStartTest}
          className="flex-1 bg-gradient-primary hover:shadow-glow transition-all"
          size="lg"
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          Start Test
        </Button>
        
        {onGenerateSolutions && (
          <Button
            onClick={onGenerateSolutions}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <FileCheck className="mr-2 h-5 w-5" />
            Generate Solutions
          </Button>
        )}

        <Button
          variant="outline"
          className="flex-1"
          size="lg"
        >
          <Download className="mr-2 h-5 w-5" />
          Download PDF
        </Button>
      </div>
    </Card>
  );
}
