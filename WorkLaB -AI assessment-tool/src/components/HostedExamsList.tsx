import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Calendar, Clock, Users, Copy, Trash2, Eye, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, formatDistanceToNow, isPast, isFuture } from "date-fns";
import { useNavigate } from "react-router-dom";

interface HostedExam {
  id: string;
  title: string;
  description: string;
  scheduled_start: string;
  duration_minutes: number;
  status: string;
  access_code: string;
  created_at: string;
}

interface HostedExamsListProps {
  refresh?: number;
  onViewDetails: (examId: string) => void;
}

export function HostedExamsList({ refresh, onViewDetails }: HostedExamsListProps) {
  const [exams, setExams] = useState<HostedExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessCode, setAccessCode] = useState("");
  const [openAccessDialog, setOpenAccessDialog] = useState(false);
  const navigate = useNavigate();

  const loadExams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('hosted_exams')
        .select('*')
        .eq('host_user_id', user.id)
        .order('scheduled_start', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error: any) {
      console.error("Error loading exams:", error);
      toast.error("Failed to load hosted exams");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, [refresh]);

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Access code copied to clipboard!");
  };

  const deleteExam = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hosted_exams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Exam deleted successfully");
      loadExams();
    } catch (error: any) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam");
    }
  };

  const handleAccessExam = () => {
    if (!accessCode.trim()) {
      toast.error("Please enter an access code");
      return;
    }
    navigate(`/take-exam?code=${accessCode.toUpperCase()}`);
    setOpenAccessDialog(false);
    setAccessCode("");
  };

  const getStatusBadge = (exam: HostedExam) => {
    const startTime = new Date(exam.scheduled_start);
    const endTime = new Date(startTime.getTime() + exam.duration_minutes * 60000);
    const now = new Date();

    if (exam.status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    } else if (exam.status === 'completed') {
      return <Badge variant="secondary">Completed</Badge>;
    } else if (isPast(endTime)) {
      return <Badge variant="secondary">Ended</Badge>;
    } else if (isPast(startTime) && isFuture(endTime)) {
      return <Badge className="bg-green-500">Active</Badge>;
    } else {
      return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (exams.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No hosted exams yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Create an assessment and host it online for students
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Dialog open={openAccessDialog} onOpenChange={setOpenAccessDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <LogIn className="h-4 w-4" />
              Access Exam with Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Access Online Exam</DialogTitle>
              <DialogDescription>
                Enter the access code provided by your instructor
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="access-code-input">Access Code</Label>
                <Input
                  id="access-code-input"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  maxLength={8}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenAccessDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAccessExam}>
                Join Exam
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {exams.map((exam) => (
        <Card key={exam.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xl">{exam.title}</CardTitle>
                <CardDescription>{exam.description}</CardDescription>
              </div>
              {getStatusBadge(exam)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(exam.scheduled_start), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(exam.scheduled_start), "HH:mm")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{exam.duration_minutes} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Access: {exam.access_code}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyAccessCode(exam.access_code)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(exam.id)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteExam(exam.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
