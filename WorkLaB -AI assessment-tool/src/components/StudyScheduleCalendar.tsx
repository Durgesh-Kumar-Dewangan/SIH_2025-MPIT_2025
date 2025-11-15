import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, Edit2, Trash2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, parseISO, addDays, startOfWeek } from "date-fns";

interface StudySession {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  course_name?: string;
  location?: string;
  session_type: string;
  color?: string;
}

interface ClassSchedule {
  id: string;
  file_name: string;
  analyzed: boolean;
  schedule_data: any;
}

export function StudyScheduleCalendar() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const { toast } = useToast();

  const [sessionForm, setSessionForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    course_name: "",
    location: "",
    session_type: "study",
    color: "hsl(var(--primary))",
  });

  useEffect(() => {
    loadSessions();
    loadSchedules();
  }, []);

  const loadSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("start_time", { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to load sessions", variant: "destructive" });
      return;
    }

    setSessions(data || []);
  };

  const loadSchedules = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("class_schedules")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load schedules", variant: "destructive" });
      return;
    }

    setSchedules(data || []);
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      setIsAnalyzing(true);

      // Upload file to storage
      const filePath = `${user.id}/${Date.now()}_${uploadFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("schedules")
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // Create schedule record
      const { data: scheduleData, error: insertError } = await supabase
        .from("class_schedules")
        .insert({
          user_id: user.id,
          file_name: uploadFile.name,
          file_path: filePath,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Read file content
      const fileText = await uploadFile.text();

      // Call analyze function
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke(
        "analyze-schedule",
        {
          body: { scheduleId: scheduleData.id, fileContent: fileText },
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
        }
      );

      if (analysisError) throw analysisError;

      toast({ title: "Success", description: "Schedule analyzed and uploaded successfully" });
      setIsUploadDialogOpen(false);
      setUploadFile(null);
      loadSchedules();
      
      // Create study sessions from analyzed data
      if (analysisResult?.scheduleData) {
        await createSessionsFromSchedule(analysisResult.scheduleData);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createSessionsFromSchedule = async (scheduleData: any[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get the start of current week
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

    // Map days to dates
    const dayMap: { [key: string]: number } = {
      Monday: 0,
      Tuesday: 1,
      Wednesday: 2,
      Thursday: 3,
      Friday: 4,
      Saturday: 5,
      Sunday: 6,
    };

    const sessionsToCreate = scheduleData.map((classItem: any) => {
      const dayOffset = dayMap[classItem.day] || 0;
      const sessionDate = addDays(weekStart, dayOffset);
      
      const startDateTime = new Date(sessionDate);
      const [startHour, startMin] = classItem.start_time.split(":");
      startDateTime.setHours(parseInt(startHour), parseInt(startMin));

      const endDateTime = new Date(sessionDate);
      const [endHour, endMin] = classItem.end_time.split(":");
      endDateTime.setHours(parseInt(endHour), parseInt(endMin));

      return {
        user_id: user.id,
        title: classItem.title,
        description: classItem.instructor || "",
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        course_name: classItem.course_code || classItem.title,
        location: classItem.location || "",
        session_type: classItem.type?.toLowerCase() || "class",
        color: "hsl(var(--primary))",
      };
    });

    const { error } = await supabase.from("study_sessions").insert(sessionsToCreate);

    if (error) {
      toast({ title: "Warning", description: "Some sessions could not be created", variant: "destructive" });
    } else {
      loadSessions();
    }
  };

  const handleSaveSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      if (editingSession) {
        const { error } = await supabase
          .from("study_sessions")
          .update(sessionForm)
          .eq("id", editingSession.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast({ title: "Success", description: "Session updated" });
      } else {
        const { error } = await supabase.from("study_sessions").insert({
          ...sessionForm,
          user_id: user.id,
        });

        if (error) throw error;
        toast({ title: "Success", description: "Session created" });
      }

      setIsSessionDialogOpen(false);
      setEditingSession(null);
      resetSessionForm();
      loadSessions();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("study_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete session", variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Session deleted" });
    loadSessions();
  };

  const resetSessionForm = () => {
    setSessionForm({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      course_name: "",
      location: "",
      session_type: "study",
      color: "hsl(var(--primary))",
    });
  };

  const openEditDialog = (session: StudySession) => {
    setEditingSession(session);
    setSessionForm({
      title: session.title,
      description: session.description || "",
      start_time: format(parseISO(session.start_time), "yyyy-MM-dd'T'HH:mm"),
      end_time: format(parseISO(session.end_time), "yyyy-MM-dd'T'HH:mm"),
      course_name: session.course_name || "",
      location: session.location || "",
      session_type: session.session_type,
      color: session.color || "hsl(var(--primary))",
    });
    setIsSessionDialogOpen(true);
  };

  const openNewSessionDialog = () => {
    setEditingSession(null);
    resetSessionForm();
    setIsSessionDialogOpen(true);
  };

  const filteredSessions = selectedDate
    ? sessions.filter((session) => {
        const sessionDate = parseISO(session.start_time);
        return format(sessionDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
      })
    : sessions;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Study Schedule</h2>
          <p className="text-muted-foreground">Upload your class schedule and manage study sessions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Schedule
          </Button>
          <Button onClick={openNewSessionDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Session
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "All Sessions"}
            </CardTitle>
            <CardDescription>
              {filteredSessions.length} session(s) scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredSessions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No sessions scheduled for this date
                </p>
              ) : (
                filteredSessions.map((session) => (
                  <Card key={session.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{session.title}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {session.session_type}
                          </span>
                        </div>
                        {session.course_name && (
                          <p className="text-sm text-muted-foreground">{session.course_name}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(session.start_time), "HH:mm")} -{" "}
                            {format(parseISO(session.end_time), "HH:mm")}
                          </span>
                          {session.location && (
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {session.location}
                            </span>
                          )}
                        </div>
                        {session.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {session.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(session)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Class Schedule</DialogTitle>
            <DialogDescription>
              Upload your class schedule file (PDF, image, or text). AI will analyze and create sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="schedule-file">Schedule File</Label>
              <Input
                id="schedule-file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFileUpload} disabled={!uploadFile || isAnalyzing}>
              {isAnalyzing ? "Analyzing..." : "Upload & Analyze"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSession ? "Edit Session" : "Add New Session"}</DialogTitle>
            <DialogDescription>
              Create or edit a study session or class
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                placeholder="e.g., Database Systems"
              />
            </div>
            <div>
              <Label htmlFor="course_name">Course Name</Label>
              <Input
                id="course_name"
                value={sessionForm.course_name}
                onChange={(e) => setSessionForm({ ...sessionForm, course_name: e.target.value })}
                placeholder="e.g., CS301"
              />
            </div>
            <div>
              <Label htmlFor="session_type">Type</Label>
              <select
                id="session_type"
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={sessionForm.session_type}
                onChange={(e) => setSessionForm({ ...sessionForm, session_type: e.target.value })}
              >
                <option value="study">Study</option>
                <option value="class">Class</option>
                <option value="lecture">Lecture</option>
                <option value="lab">Lab</option>
                <option value="tutorial">Tutorial</option>
                <option value="exam">Exam</option>
              </select>
            </div>
            <div>
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={sessionForm.start_time}
                onChange={(e) => setSessionForm({ ...sessionForm, start_time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={sessionForm.end_time}
                onChange={(e) => setSessionForm({ ...sessionForm, end_time: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={sessionForm.location}
                onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                placeholder="e.g., Room 101, Building A"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={sessionForm.description}
                onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSessionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSession}>
              {editingSession ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
