import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Clock, Send, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, differenceInSeconds } from "date-fns";
import ReactMarkdown from "react-markdown";

export default function TakeExam() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState(searchParams.get("code") || "");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [exam, setExam] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (exam && session && session.status === 'in_progress') {
      const startTime = new Date(exam.scheduled_start);
      const endTime = new Date(startTime.getTime() + exam.duration_minutes * 60000);
      
      interval = setInterval(() => {
        const remaining = differenceInSeconds(endTime, new Date());
        setTimeRemaining(Math.max(0, remaining));
        
        if (remaining <= 0 && !exam.allow_late_submission) {
          handleSubmit(true); // Auto-submit
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [exam, session]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const joinExam = async () => {
    if (!accessCode || !studentName) {
      toast.error("Please enter access code and your name");
      return;
    }

    setIsLoading(true);
    try {
      const { data: examData, error: examError } = await supabase
        .from('hosted_exams')
        .select('*')
        .eq('access_code', accessCode.toUpperCase())
        .single();

      if (examError) throw new Error("Invalid access code");

      const now = new Date();
      const startTime = new Date(examData.scheduled_start);
      const endTime = new Date(startTime.getTime() + examData.duration_minutes * 60000);

      if (now < startTime) {
        throw new Error(`Exam hasn't started yet. Starts at ${format(startTime, 'PPP p')}`);
      }

      if (now > endTime && !examData.allow_late_submission) {
        throw new Error("Exam has ended");
      }

      // Create or get session
      const { data: sessionData, error: sessionError } = await supabase
        .from('student_exam_sessions')
        .insert({
          hosted_exam_id: examData.id,
          student_name: studentName,
          student_email: studentEmail,
          started_at: new Date().toISOString(),
          status: 'in_progress'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setExam(examData);
      setSession(sessionData);
      toast.success("Joined exam successfully!");
    } catch (error: any) {
      console.error("Error joining exam:", error);
      toast.error(error.message || "Failed to join exam");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('student_exam_sessions')
        .update({
          answers: answers,
          submitted_at: new Date().toISOString(),
          status: 'submitted'
        })
        .eq('id', session.id);

      if (error) throw error;

      toast.success(autoSubmit ? "Time's up! Exam auto-submitted" : "Exam submitted successfully!");
      
      // Evaluate answers
      const { data: evalData, error: evalError } = await supabase.functions.invoke('evaluate-test', {
        body: {
          questions: exam.assessment_data.topics.flatMap((t: any) => t.questions || []),
          answers: answers
        }
      });

      if (evalError) throw evalError;

      await supabase
        .from('student_exam_sessions')
        .update({
          evaluation_result: evalData,
          score: evalData.totalScore,
          status: 'evaluated'
        })
        .eq('id', session.id);

      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!exam || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Join Online Exam</CardTitle>
            <CardDescription>Enter your access code to begin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="access-code">Access Code</Label>
              <Input
                id="access-code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                maxLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <Button onClick={joinExam} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Exam"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questions = exam.assessment_data.topics.flatMap((topic: any, topicIndex: number) => 
    (topic.questions || []).map((q: any, qIndex: number) => ({
      ...q,
      id: `${topicIndex}-${qIndex}`,
      topic: topic.topic
    }))
  );

  const progress = (Object.keys(answers).length / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Timer Bar */}
      <div className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">{exam.title}</h2>
            <p className="text-sm text-muted-foreground">Student: {studentName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Time Remaining</div>
              <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-destructive' : ''}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
            <Button onClick={() => handleSubmit()} disabled={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              Submit
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Questions */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {questions.map((question: any, index: number) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    <CardDescription>Topic: {question.topic}</CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {question.marks} marks
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{question.question}</ReactMarkdown>
                </div>
                <Textarea
                  value={answers[question.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  placeholder="Write your answer here..."
                  rows={6}
                  disabled={isSubmitting}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
