import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, Loader2, Edit, Save, X, MapPin, Link as LinkIcon,
  BookOpen, Award, TrendingUp, User as UserIcon, Camera, Lightbulb, GraduationCap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ProgressCircle } from "@/components/ProgressCircle";

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  institute_enrollment: string | null;
  website: string | null;
  introduction: string | null;
  social_media_id: string | null;
  department: string | null;
  major: string | null;
  year_of_study: string | null;
  student_id: string | null;
  academic_advisor: string | null;
  gpa: number | null;
  expected_graduation: string | null;
  academic_status: string | null;
  created_at: string;
}

interface LabWork {
  id: string;
  title: string;
  language: string;
  likes_count: number;
  created_at: string;
}

interface ExamSession {
  id: string;
  score: number | null;
  hosted_exam_id: string;
  submitted_at: string | null;
}

interface Suggestion {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [labWorks, setLabWorks] = useState<LabWork[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ProfileData | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to view your profile");
        navigate("/auth");
        return;
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData as any);

      // Load lab works
      const { data: labWorksData, error: labWorksError } = await supabase
        .from("lab_works")
        .select("id, title, language, likes_count, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (labWorksError) throw labWorksError;
      setLabWorks(labWorksData || []);

      // Load exam sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("student_exam_sessions")
        .select("id, score, submitted_at, hosted_exam_id")
        .eq("student_user_id", user.id)
        .order("submitted_at", { ascending: false });

      if (sessionsError) throw sessionsError;
      setExamSessions(sessionsData || []);
    } catch (error: any) {
      console.error("Error loading profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const completedSessions = examSessions.filter(s => s.score !== null);
    const averageScore = completedSessions.length > 0
      ? completedSessions.reduce((acc, s) => acc + (s.score || 0), 0) / completedSessions.length
      : 0;

    const totalLikes = labWorks.reduce((acc, w) => acc + w.likes_count, 0);

    return {
      averageScore: averageScore.toFixed(1),
      totalExams: completedSessions.length,
      totalLabWorks: labWorks.length,
      totalLikes,
    };
  };

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(null);
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error("Not authenticated");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.data.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl } as any)
        .eq("user_id", user.data.user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      toast.success("Photo updated successfully!");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    setIsSuggestionsOpen(true);
    
    try {
      const userData = {
        averageScore: examSessions.length > 0 
          ? examSessions.reduce((sum, session) => sum + (session.score || 0), 0) / examSessions.length
          : 0,
        totalExams: examSessions.length,
        completedExams: examSessions.filter(s => s.score !== null).length,
        labWorksCount: labWorks.length,
        gpa: profile?.gpa,
        major: profile?.major,
        yearOfStudy: profile?.year_of_study
      };

      const { data, error } = await supabase.functions.invoke('profile-suggestions', {
        body: { userData }
      });

      if (error) throw error;
      
      setSuggestions(data.suggestions || []);
    } catch (error: any) {
      console.error("Error getting suggestions:", error);
      toast.error("Failed to get suggestions");
      setSuggestions([{
        title: "Unable to generate suggestions",
        description: "Please try again later or check your connection.",
        priority: "low"
      }]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editedProfile.full_name,
          bio: editedProfile.bio,
          location: editedProfile.location,
          website: editedProfile.website,
          introduction: editedProfile.introduction,
          institute_enrollment: editedProfile.institute_enrollment,
          social_media_id: editedProfile.social_media_id,
          department: editedProfile.department,
          major: editedProfile.major,
          year_of_study: editedProfile.year_of_study,
          student_id: editedProfile.student_id,
          academic_advisor: editedProfile.academic_advisor,
          gpa: editedProfile.gpa,
          expected_graduation: editedProfile.expected_graduation,
          academic_status: editedProfile.academic_status,
        } as any)
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = calculateStats();
  const studyProgress = Math.min(Math.round((stats.totalExams / 10) * 100), 100);
  const averageScore = parseFloat(stats.averageScore);

  const displayProfile = isEditing ? editedProfile : profile;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button onClick={handleEdit} variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button onClick={handleGetSuggestions} variant="default" className="gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Get Suggestions
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={handleCancel} 
                    variant="outline" 
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-6">
          {/* Profile Header Card */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-8">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-primary/20">
                    <AvatarImage src={displayProfile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                      {displayProfile?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  />
                </div>
                
                <div className="flex-1 space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={editedProfile?.full_name || ""}
                          onChange={(e) => setEditedProfile({ ...editedProfile!, full_name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          value={editedProfile?.bio || ""}
                          onChange={(e) => setEditedProfile({ ...editedProfile!, bio: e.target.value })}
                          placeholder="Short bio about yourself"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={editedProfile?.location || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile!, location: e.target.value })}
                            placeholder="City, Country"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={editedProfile?.website || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile!, website: e.target.value })}
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="enrollment">Enrollment ID</Label>
                          <Input
                            id="enrollment"
                            value={editedProfile?.institute_enrollment || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile!, institute_enrollment: e.target.value })}
                            placeholder="Your enrollment number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="social_media">Social Media Handle</Label>
                          <Input
                            id="social_media"
                            value={editedProfile?.social_media_id || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile!, social_media_id: e.target.value })}
                            placeholder="@username"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="student_id">Student ID</Label>
                          <Input
                            id="student_id"
                            value={editedProfile?.student_id || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile!, student_id: e.target.value })}
                            placeholder="Your student ID"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="major">Major</Label>
                          <Input
                            id="major"
                            value={editedProfile?.major || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile!, major: e.target.value })}
                            placeholder="Your major"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            value={editedProfile?.department || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile!, department: e.target.value })}
                            placeholder="Your department"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="year">Year of Study</Label>
                          <Input
                            id="year"
                            value={editedProfile?.year_of_study || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile!, year_of_study: e.target.value })}
                            placeholder="e.g., 3rd Year"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gpa">GPA</Label>
                          <Input
                            id="gpa"
                            type="number"
                            step="0.01"
                            min="0"
                            max="4"
                            value={editedProfile?.gpa || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile!, gpa: parseFloat(e.target.value) || null })}
                            placeholder="e.g., 3.75"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="graduation">Expected Graduation</Label>
                          <Input
                            id="graduation"
                            value={editedProfile?.expected_graduation || ""}
                            onChange={(e) => setEditedProfile({ ...editedProfile!, expected_graduation: e.target.value })}
                            placeholder="e.g., May 2025"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="advisor">Academic Advisor</Label>
                        <Input
                          id="advisor"
                          value={editedProfile?.academic_advisor || ""}
                          onChange={(e) => setEditedProfile({ ...editedProfile!, academic_advisor: e.target.value })}
                          placeholder="Advisor's name"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{displayProfile?.full_name || "User"}</h1>
                        <p className="text-muted-foreground mb-4">{displayProfile?.bio || "No bio yet"}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {displayProfile?.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {displayProfile.location}
                            </div>
                          )}
                          {displayProfile?.institute_enrollment && (
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              ID: {displayProfile.institute_enrollment}
                            </div>
                          )}
                          {displayProfile?.social_media_id && (
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              {displayProfile.social_media_id}
                            </div>
                          )}
                          {displayProfile?.major && (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4" />
                              {displayProfile.major}
                              {displayProfile.department && ` - ${displayProfile.department}`}
                            </div>
                          )}
                          {displayProfile?.gpa && (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4" />
                              GPA: {displayProfile.gpa.toFixed(2)}
                            </div>
                          )}
                          {displayProfile?.website && (
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-4 w-4" />
                              <a href={displayProfile.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                                Website
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalExams}</div>
                <p className="text-xs text-muted-foreground">Completed exams</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <p className="text-xs text-muted-foreground">Overall performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lab Works</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLabWorks}</div>
                <p className="text-xs text-muted-foreground">Created projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLikes}</div>
                <p className="text-xs text-muted-foreground">On lab works</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Circles */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ProgressCircle 
                  percentage={studyProgress} 
                  label="Learning Progress"
                  size={200}
                  strokeWidth={16}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Score</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ProgressCircle 
                  percentage={Math.round(averageScore)} 
                  label="Average Performance"
                  size={200}
                  strokeWidth={16}
                />
              </CardContent>
            </Card>
          </div>

          {/* Recent Lab Works */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Lab Works</CardTitle>
            </CardHeader>
            <CardContent>
              {labWorks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No lab works yet. Create your first project!
                </p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {labWorks.slice(0, 6).map((work) => (
                    <Card key={work.id} className="border-muted">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold mb-2">{work.title}</h3>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{work.language}</span>
                          <span className="flex items-center gap-1">
                            ❤️ {work.likes_count}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Suggestions Dialog */}
      <Dialog open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Performance Improvement Suggestions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        suggestion.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                        suggestion.priority === 'medium' ? 'bg-primary/10 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {suggestion.priority}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{suggestion.title}</h3>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No suggestions available at this time.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
