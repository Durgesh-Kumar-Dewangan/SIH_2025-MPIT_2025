import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { User, Mail, Loader2, Save, LogOut, FileText, Users, UserPlus, Image as ImageIcon, Video, Newspaper, MapPin, Globe, Briefcase, Facebook, Twitter, Instagram, Youtube, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Profile {
  full_name: string;
  avatar_url: string;
  bio: string;
  social_media_id?: string;
  institute_enrollment?: string;
  website?: string;
  location?: string;
  introduction?: string;
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  youtube_url?: string;
}

export function ProfileSection() {
  const [profile, setProfile] = useState<Profile>({ 
    full_name: "", 
    avatar_url: "", 
    bio: "",
    social_media_id: "",
    institute_enrollment: "",
    website: "",
    location: "",
    introduction: "",
    posts_count: 0,
    followers_count: 0,
    following_count: 0,
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    youtube_url: ""
  });
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          avatar_url: data.avatar_url || "",
          bio: data.bio || "",
          social_media_id: data.social_media_id || "",
          institute_enrollment: data.institute_enrollment || "",
          website: data.website || "",
          location: data.location || "",
          introduction: data.introduction || "",
          posts_count: data.posts_count || 0,
          followers_count: data.followers_count || 0,
          following_count: data.following_count || 0,
          facebook_url: data.facebook_url || "",
          twitter_url: data.twitter_url || "",
          instagram_url: data.instagram_url || "",
          youtube_url: data.youtube_url || ""
        });
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          website: profile.website,
          location: profile.location,
          introduction: profile.introduction,
          facebook_url: profile.facebook_url,
          twitter_url: profile.twitter_url,
          instagram_url: profile.instagram_url,
          youtube_url: profile.youtube_url
        });

      if (error) throw error;
      toast.success("Profile updated successfully!");
      setIsEditMode(false);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 shadow-soft flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        {/* Decorative Header with Wave Pattern */}
        <div className="relative h-48 bg-gradient-to-br from-violet-400 via-purple-400 to-violet-300">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" fill="hsl(var(--card))" opacity="0.3" />
            <path d="M0,20 C200,100 400,20 600,70 C800,120 1000,40 1200,80 L1200,120 L0,120 Z" fill="hsl(var(--card))" opacity="0.5" />
            <path d="M0,40 C250,120 450,60 600,90 C850,120 1050,70 1200,100 L1200,120 L0,120 Z" fill="hsl(var(--card))" />
          </svg>
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pb-6 -mt-16">
          <div className="flex flex-col items-center mb-6">
            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-card shadow-lg mb-4">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-gradient-primary text-white text-4xl">
                {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* Stats */}
            <div className="flex gap-8 mb-4">
              <div className="text-center">
                <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-2xl font-bold">{profile.posts_count || 0}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-2xl font-bold">{profile.followers_count?.toLocaleString() || 0}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <UserPlus className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-2xl font-bold">{profile.following_count?.toLocaleString() || 0}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </div>

            {/* Name and Role */}
            <h2 className="text-2xl font-bold mb-1">{profile.full_name || "User Profile"}</h2>
            <p className="text-muted-foreground mb-4">{profile.bio || "Designer"}</p>

            {/* Social Media Icons and Actions */}
            <div className="flex items-center gap-3">
              {profile.facebook_url && (
                <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {profile.twitter_url && (
                <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {profile.instagram_url && (
                <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {profile.youtube_url && (
                <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              <Button onClick={() => setIsEditMode(!isEditMode)} className="ml-2">
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditMode ? "Cancel" : "Edit Profile"}
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Mode Form */}
      {isEditMode && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Role/Title</Label>
                <Input
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="e.g., Designer, Developer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar-url">Avatar URL</Label>
              <Input
                id="avatar-url"
                value={profile.avatar_url}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="introduction">Introduction</Label>
              <Textarea
                id="introduction"
                value={profile.introduction}
                onChange={(e) => setProfile({ ...profile, introduction: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="www.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  value={profile.facebook_url}
                  onChange={(e) => setProfile({ ...profile, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  value={profile.twitter_url}
                  onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={profile.instagram_url}
                  onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube URL</Label>
                <Input
                  id="youtube"
                  value={profile.youtube_url}
                  onChange={(e) => setProfile({ ...profile, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs Section */}
      <Card className="p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Followers
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Introduction Section */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Introduction</h3>
                <p className="text-muted-foreground mb-6">
                  {profile.introduction || "Hello, I am " + (profile.full_name || "User") + ". I love making websites and graphics. Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
                </p>

                <div className="space-y-3">
                  {profile.institute_enrollment && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Briefcase className="h-5 w-5" />
                      <span>{profile.institute_enrollment}</span>
                    </div>
                  )}
                  {email && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="h-5 w-5" />
                      <span>{email}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Globe className="h-5 w-5" />
                      <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                         target="_blank" rel="noopener noreferrer" 
                         className="hover:text-primary transition-colors">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Share Thoughts Section */}
              <Card className="p-6">
                <Textarea
                  placeholder="Share your thoughts"
                  className="mb-4 min-h-[100px]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Photo / Video
                    </Button>
                    <Button variant="outline" size="sm">
                      <Newspaper className="h-4 w-4 mr-2" />
                      Article
                    </Button>
                  </div>
                  <Button>Post</Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="followers">
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No followers to display yet</p>
            </div>
          </TabsContent>

          <TabsContent value="friends">
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No friends to display yet</p>
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No gallery items to display yet</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}