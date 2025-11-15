import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SyllabusUpload } from "@/components/SyllabusUpload";
import { ExamInterface } from "@/components/ExamInterface";
import { ProgressReport } from "@/components/ProgressReport";
import { ProfileSection } from "@/components/ProfileSection";
import { AppAppearance } from "@/components/AppAppearance";
import { HostExamDialog } from "@/components/HostExamDialog";
import { HostedExamsList } from "@/components/HostedExamsList";
import LabWork from "@/pages/LabWork";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, TrendingUp, Play, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AppView = "dashboard" | "assessments" | "progress" | "settings" | "exam" | "profile" | "hosted" | "lab-work";

interface AssessmentData {
  subject?: string;
  topics: string[];
  questions: any[];
  totalMarks: number;
  estimatedTime: number;
  timeLimit?: number;
  provider?: "gemini" | "openai";
}

const DashboardIndex = () => {
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isExamActive, setIsExamActive] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);
  const [completedAssessments, setCompletedAssessments] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [hostedRefresh, setHostedRefresh] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate("/auth");
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSyllabusAnalyzed = (data: AssessmentData) => {
    setAssessmentData(data);
    toast.success("Assessment ready! Click 'Start Assessment' to begin.");
  };

  const handleStartExam = () => {
    if (!assessmentData) {
      toast.error("Please upload and analyze a syllabus first");
      return;
    }
    setIsExamActive(true);
    setCurrentView("exam");
  };

  const handleSubmitExam = async (answers: Record<string, { text: string; file?: File }>) => {
    if (!assessmentData) return;

    setIsEvaluating(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer: answer.text,
        hasFile: !!answer.file,
      }));

      const { data, error } = await supabase.functions.invoke("evaluate-answers", {
        body: {
          questions: assessmentData.questions,
          answers: formattedAnswers,
          totalMarks: assessmentData.totalMarks,
        },
      });

      if (error) throw error;

      setProgressData(data.results);
      setCompletedAssessments([...completedAssessments, data.results]);
      setIsExamActive(false);
      setCurrentView("progress");
      toast.success("Assessment evaluated successfully!");
    } catch (error: any) {
      console.error("Error evaluating exam:", error);
      toast.error(error.message || "Failed to evaluate assessment");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRetake = () => {
    setAssessmentData(null);
    setIsExamActive(false);
    setProgressData(null);
    setCurrentView("dashboard");
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as AppView);
  };

  const getPageTitle = () => {
    switch (currentView) {
      case "dashboard":
        return "Student Dashboard";
      case "assessments":
        return "Assessments";
      case "progress":
        return "Progress & Reports";
      case "profile":
        return "Profile";
      case "settings":
        return "App Appearance";
      case "exam":
        return "Assessment in Progress";
      case "hosted":
        return "Hosted Exams";
      case "lab-work":
        return "Lab Work";
      default:
        return "Dashboard";
    }
  };

  const getPageSubtitle = () => {
    switch (currentView) {
      case "dashboard":
        return "AI-Powered Syllabus Analysis & Assessment Generation";
      case "profile":
        return "Manage your account";
      case "settings":
        return "App Appearance";
      case "hosted":
        return "Manage online exams with real-time monitoring";
      case "lab-work":
        return "Share your code and collaborate with the community";
      default:
        return "";
    }
  };

  if (!session) {
    return null; // Loading state while checking auth
  }

  return (
    <DashboardLayout
      currentView={currentView}
      onViewChange={handleViewChange}
      pageTitle={getPageTitle()}
      pageSubtitle={getPageSubtitle()}
    >
      {/* Dashboard View */}
      {currentView === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <SyllabusUpload onSyllabusAnalyzed={handleSyllabusAnalyzed} />
            </div>

            <Card className="p-6 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Topics Covered</h3>
                  <div className="text-2xl font-bold text-primary">
                    {assessmentData?.topics.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {assessmentData ? "Ready for assessment" : "Upload syllabus to begin"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Brain className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">AI-Generated Questions</h3>
                  <div className="text-2xl font-bold text-secondary">
                    {assessmentData?.questions.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total marks: {assessmentData?.totalMarks || 0}
                  </p>
                </div>
              </div>
            </Card>

            {assessmentData && (
              <Card className="p-6 shadow-medium md:col-span-2 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Assessment Ready!</h3>
                    <p className="text-muted-foreground mb-1">
                      {assessmentData.questions.length} questions • {assessmentData.totalMarks} marks
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Estimated time: {assessmentData.estimatedTime} minutes
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleStartExam} size="lg" className="bg-gradient-primary">
                      <Play className="mr-2 h-5 w-5" />
                      Start Assessment
                    </Button>
                    <HostExamDialog 
                      assessmentData={assessmentData}
                      onHosted={() => {
                        setHostedRefresh(prev => prev + 1);
                        toast.success("View your hosted exam in the 'Hosted Exams' section");
                      }}
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {currentView === "progress" && progressData && (
        <ProgressReport results={progressData} onRetake={handleRetake} />
      )}

      {currentView === "progress" && !progressData && (
        <Card className="p-6 shadow-medium">
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Progress Data Yet</h3>
            <p className="text-muted-foreground mb-6">
              Complete an assessment to see your progress report
            </p>
            <Button onClick={() => setCurrentView("dashboard")}>Go to Dashboard</Button>
          </div>
        </Card>
      )}

      {/* Profile View */}
      {currentView === "profile" && (
        <ProfileSection />
      )}

      {/* Settings View */}
      {currentView === "settings" && (
        <AppAppearance />
      )}

      {/* Hosted Exams View */}
      {currentView === "hosted" && (
        <div className="space-y-6">
          <HostedExamsList 
            refresh={hostedRefresh}
            onViewDetails={(examId) => {
              toast.info("Exam details coming soon!");
            }}
          />
        </div>
      )}

      {/* Lab Work View */}
      {currentView === "lab-work" && <LabWork />}

      {currentView === "exam" && isExamActive && assessmentData && (
        <ExamInterface
          subject={assessmentData.subject}
          questions={assessmentData.questions}
          totalTime={assessmentData.timeLimit || assessmentData.estimatedTime}
          onSubmit={handleSubmitExam}
          isLoading={isEvaluating}
        />
      )}
    </DashboardLayout>
  );
};

export default DashboardIndex;
