import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { 
  ArrowLeft, Edit, BookOpen, Code, Clock, 
  TrendingUp, Users, Calendar as CalendarIcon,
  CheckCircle2, Circle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditProfileDialog } from "./EditProfileDialog";

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  institute_enrollment: string | null;
}

interface Skill {
  name: string;
  level: number;
}

interface Interest {
  name: string;
  progress: number;
}

interface StudySession {
  date: string;
  hours: number;
}

export default function EnhancedProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Mock data - replace with real data from your database
  const [skills] = useState<Skill[]>([
    { name: "Komunikasi", level: 85 },
    { name: "Problem Solving", level: 92 },
    { name: "Teamwork", level: 78 },
  ]);

  const [interests] = useState<Interest[]>([
    { name: "UI/UX Design", progress: 75 },
    { name: "Web Development", progress: 88 },
    { name: "Data Science", progress: 65 },
  ]);

  const [studyTime] = useState({
    current: 95,
    target: 120,
    percentage: 79,
  });

  const [ongoingCourses] = useState([
    { id: 1, name: "Kursus Matematika", instructor: "Dr. Ahmad", progress: 65 },
    { id: 2, name: "Fisika Lanjut", instructor: "Prof. Sarah", progress: 45 },
  ]);

  const [teachers] = useState([
    { id: 1, name: "Dr. Ahmad", avatar: null },
    { id: 2, name: "Prof. Sarah", avatar: null },
    { id: 3, name: "Mr. John", avatar: null },
    { id: 4, name: "Ms. Diana", avatar: null },
  ]);

  const [tasks] = useState([
    { id: 1, title: "01 november 2024", completed: false },
    { id: 2, title: "Selesai tugas kelompok", completed: true },
    { id: 3, title: "4 ceramah di kg, buku kursangsung", completed: false },
  ]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to view your profile");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold">My Profile</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                      {profile.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{profile.full_name || "User"}</h2>
                    <p className="text-sm text-muted-foreground">
                      {profile.institute_enrollment || "Student"}
                    </p>
                  </div>
                  <div className="w-full space-y-2 text-left">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status of Work</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-3 w-3" />
                        <span>Mahasiswa</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Code className="h-3 w-3" />
                        <span>Developer</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Courses</span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Assignments</span>
                  <span className="font-bold">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Performance</span>
                  <span className="font-bold">85%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Soft Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Soft Skill</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{skill.name}</span>
                      <span className="text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Grid Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Study Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Waktu Belajar
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${studyTime.percentage * 3.51} 351`}
                        className="text-primary"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{studyTime.percentage}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    {studyTime.current} / {studyTime.target} hours
                  </p>
                </CardContent>
              </Card>

              {/* Areas of Interest */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bidang Minat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interests.map((interest, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{interest.name}</span>
                        <span className="text-muted-foreground">{interest.progress}%</span>
                      </div>
                      <Progress value={interest.progress} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Ongoing Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sedang Berlangsung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ongoingCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{course.name}</p>
                      <p className="text-xs text-muted-foreground">{course.instructor}</p>
                    </div>
                    <Badge variant="secondary">{course.progress}%</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Teacher History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Riwayat Pengajar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="flex flex-col items-center gap-2">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={teacher.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          {teacher.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-center">{teacher.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attendance Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Presensi
                </CardTitle>
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
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Summary */}
            <Card className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-20 w-20 border-4 border-accent/20">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-accent text-accent-foreground text-xl">
                      {profile.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold">{profile.full_name || "User"}</h3>
                    <p className="text-xs text-muted-foreground">
                      {profile.institute_enrollment || "Student"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tugas Saya</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">This Week</span>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      +12%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">This Month</span>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      +8%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall</span>
                    <span className="font-bold text-success">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <EditProfileDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        profile={profile}
        onProfileUpdate={loadProfile}
      />
    </div>
  );
}
