import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Play, Share2, User, Calendar, Heart, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { StudyScheduleCalendar } from "@/components/StudyScheduleCalendar";

interface LabWork {
  id: string;
  user_id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  output: string;
  likes_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export default function LabWork() {
  const [works, setWorks] = useState<LabWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [openShareDialog, setOpenShareDialog] = useState(false);

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_works')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorks(data || []);
    } catch (error: any) {
      console.error("Error loading lab works:", error);
      toast.error("Failed to load lab works");
    } finally {
      setIsLoading(false);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running code...");

    try {
      // Use edge function for actual code execution
      const { data, error } = await supabase.functions.invoke('run-code', {
        body: { code, language }
      });

      if (error) throw error;

      if (data.error) {
        setOutput(`Error: ${data.error}`);
      } else {
        setOutput(data.output || 'Code executed successfully');
      }
    } catch (error: any) {
      console.error('Code execution error:', error);
      setOutput(`Error: ${error.message || 'Failed to execute code'}`);
      toast.error('Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };

  const shareWork = async () => {
    if (!title.trim() || !code.trim()) {
      toast.error("Please provide a title and code");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to share your work");
        return;
      }

      const { error } = await supabase
        .from('lab_works')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          code,
          language,
          output,
          likes_count: 0
        });

      if (error) throw error;

      toast.success("Work shared successfully!");
      setOpenShareDialog(false);
      setTitle("");
      setDescription("");
      setCode("");
      setOutput("");
      loadWorks();
    } catch (error: any) {
      console.error("Error sharing work:", error);
      toast.error("Failed to share work");
    }
  };

  const likeWork = async (workId: string) => {
    try {
      const work = works.find(w => w.id === workId);
      if (!work) return;

      const { error } = await supabase
        .from('lab_works')
        .update({ likes_count: work.likes_count + 1 })
        .eq('id', workId);

      if (error) throw error;

      setWorks(works.map(w => 
        w.id === workId ? { ...w, likes_count: w.likes_count + 1 } : w
      ));
    } catch (error: any) {
      console.error("Error liking work:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-primary opacity-10 blur-3xl -z-10" />
        <h1 className="text-4xl font-bold gradient-text mb-2">Lab Work</h1>
        <p className="text-muted-foreground">Share your code and collaborate with the community</p>
      </div>

      <Tabs defaultValue="compiler" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="compiler">Code Compiler</TabsTrigger>
          <TabsTrigger value="community">Community Work</TabsTrigger>
          <TabsTrigger value="schedule">Study Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="compiler" className="space-y-4">
          <Card className="border-primary/20 shadow-glow">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Code Editor
                  </CardTitle>
                  <CardDescription>Write and run your code</CardDescription>
                </div>
                <Dialog open={openShareDialog} onOpenChange={setOpenShareDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity">
                      <Share2 className="h-4 w-4" />
                      Share Work
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share Your Work</DialogTitle>
                      <DialogDescription>
                        Share your code with the community
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="work-title">Title *</Label>
                        <Input
                          id="work-title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="My Amazing Project"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="work-description">Description</Label>
                        <Textarea
                          id="work-description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe what your code does..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setOpenShareDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={shareWork}>Share</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="c">C</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="ruby">Ruby</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="code-editor">Code</Label>
                  <Button 
                    onClick={runCode} 
                    disabled={isRunning} 
                    size="sm" 
                    className="gap-2 bg-gradient-accent hover:opacity-90 transition-opacity"
                  >
                    <Play className="h-4 w-4" />
                    {isRunning ? "Running..." : "Run Code"}
                  </Button>
                </div>
                <Textarea
                  id="code-editor"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`// Write your ${language} code here\nconsole.log("Hello, Worklab!");`}
                  className="font-mono text-sm min-h-[300px]"
                />
              </div>

              {output && (
                <div className="space-y-2">
                  <Label>Output</Label>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm whitespace-pre-wrap min-h-[100px]">
                    {output}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : works.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No shared work yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Be the first to share your code with the community!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {works.map((work) => (
                <Card key={work.id} className="hover:shadow-glow hover:border-primary/40 transition-all duration-300 group">
                  <CardHeader className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:gradient-text transition-all">{work.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {work.description || "No description"}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-gradient-primary text-primary-foreground border-0">{work.language}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{work.profiles?.full_name || "Anonymous"}</span>
                      <Calendar className="h-4 w-4 ml-2" />
                      <span>{format(new Date(work.created_at), "MMM dd, yyyy")}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <pre className="font-mono text-xs overflow-x-auto max-h-[200px] overflow-y-auto">
                        <code>{work.code}</code>
                      </pre>
                    </div>
                    {work.output && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Output:</p>
                        <pre className="font-mono text-xs">{work.output}</pre>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likeWork(work.id)}
                        className="gap-1 hover:text-accent transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        {work.likes_count}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 hover:text-primary transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        Comment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule">
          <StudyScheduleCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}
