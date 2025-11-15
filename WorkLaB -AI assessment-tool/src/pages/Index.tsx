import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QuestionPaperForm } from "@/components/QuestionPaperForm";
import { GeneratedPaper } from "@/components/GeneratedPaper";
import { TestInterface } from "@/components/TestInterface";
import { PerformanceDashboard } from "@/components/PerformanceDashboard";
import { Brain, Sparkles, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AppState = "form" | "paper" | "test" | "results";

interface FormData {
  subject: string;
  classLevel: string;
  totalMarks: string;
  difficulty: string;
  bookType: string;
  chapters: string;
  topics: string;
  instructions: string;
  patternType: string;
  syllabus: string;
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState("");
  const [testResults, setTestResults] = useState<any>(null);
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);

  const handleGeneratePaper = async (formData: FormData) => {
    setIsLoading(true);
    setCurrentFormData(formData);

    try {
      const { data, error } = await supabase.functions.invoke("generate-paper", {
        body: { formData },
      });

      if (error) throw error;

      setGeneratedPaper(data.paper);
      setAppState("paper");
      toast.success("Question paper generated successfully!");
    } catch (error: any) {
      console.error("Error generating paper:", error);
      toast.error(error.message || "Failed to generate question paper");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTest = () => {
    setAppState("test");
  };

  const handleSubmitTest = async (answers: Record<string, string>) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("evaluate-test", {
        body: {
          paper: generatedPaper,
          answers,
          totalMarks: currentFormData?.totalMarks || "100",
        },
      });

      if (error) throw error;

      setTestResults(data.results);
      setAppState("results");
      toast.success("Test evaluated successfully!");
    } catch (error: any) {
      console.error("Error evaluating test:", error);
      toast.error(error.message || "Failed to evaluate test");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetake = () => {
    setAppState("form");
    setGeneratedPaper("");
    setTestResults(null);
    setCurrentFormData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Worklab</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section - Only show on form state */}
      {appState === "form" && (
        <section className="py-20 px-4 text-center">
          <div className="container mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Powered by AI</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold gradient-text mb-6 leading-tight">
              Generate Custom Question Papers in Seconds
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create tailored question papers, evaluate answers with AI, and get detailed performance insights instantly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 rounded-xl glass-card shadow-soft">
                <GraduationCap className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">Custom Generation</h3>
                <p className="text-sm text-muted-foreground">Tailored to your syllabus and difficulty level</p>
              </div>
              
              <div className="p-6 rounded-xl glass-card shadow-soft">
                <Brain className="h-10 w-10 mx-auto mb-3 text-secondary" />
                <h3 className="font-semibold mb-2">AI Evaluation</h3>
                <p className="text-sm text-muted-foreground">Instant grading with detailed feedback</p>
              </div>
              
              <div className="p-6 rounded-xl glass-card shadow-soft">
                <Sparkles className="h-10 w-10 mx-auto mb-3 text-accent" />
                <h3 className="font-semibold mb-2">Smart Insights</h3>
                <p className="text-sm text-muted-foreground">Performance analysis and improvement tips</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {appState === "form" && (
          <QuestionPaperForm onGenerate={handleGeneratePaper} isLoading={isLoading} />
        )}

        {appState === "paper" && (
          <GeneratedPaper paper={generatedPaper} onStartTest={handleStartTest} />
        )}

        {appState === "test" && (
          <TestInterface
            paper={generatedPaper}
            onSubmit={handleSubmitTest}
            isLoading={isLoading}
          />
        )}

        {appState === "results" && testResults && (
          <PerformanceDashboard result={testResults} onRetake={handleRetake} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Powered by Gemini AI • Built with React & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
