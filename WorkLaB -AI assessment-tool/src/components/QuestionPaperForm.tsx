import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, FileText, Upload } from "lucide-react";
import { toast } from "sonner";

interface QuestionPaperFormProps {
  onGenerate: (formData: FormData) => void;
  isLoading: boolean;
}

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

export function QuestionPaperForm({ onGenerate, isLoading }: QuestionPaperFormProps) {
  const [formData, setFormData] = useState<FormData>({
    subject: "",
    classLevel: "",
    totalMarks: "",
    difficulty: "",
    bookType: "",
    chapters: "",
    topics: "",
    instructions: "",
    patternType: "",
    syllabus: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.classLevel || !formData.totalMarks) {
      toast.error("Please fill in all required fields");
      return;
    }

    onGenerate(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setFormData({ ...formData, syllabus: text });
        toast.success("Syllabus uploaded successfully");
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="p-8 glass-card shadow-large">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold gradient-text mb-2">Generate Question Paper</h2>
          <p className="text-muted-foreground">Fill in the details to create your custom test</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="e.g., Mathematics"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classLevel">Class Level *</Label>
            <Input
              id="classLevel"
              placeholder="e.g., Undergraduate"
              value={formData.classLevel}
              onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalMarks">Total Marks *</Label>
            <Select value={formData.totalMarks} onValueChange={(value) => setFormData({ ...formData, totalMarks: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select marks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="60">60</SelectItem>
                <SelectItem value="75">75</SelectItem>
                <SelectItem value="80">80</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level *</Label>
            <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookType">Book Type *</Label>
            <Select value={formData.bookType} onValueChange={(value) => setFormData({ ...formData, bookType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select book type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ncert">NCERT</SelectItem>
                <SelectItem value="cbse">CBSE</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patternType">Pattern Type *</Label>
            <Select value={formData.patternType} onValueChange={(value) => setFormData({ ...formData, patternType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="board">Board</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="mcq">MCQ</SelectItem>
                <SelectItem value="descriptive">Descriptive</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chapters">Chapters (comma-separated)</Label>
          <Input
            id="chapters"
            placeholder="e.g., Linear Equations, Quadratic Equations"
            value={formData.chapters}
            onChange={(e) => setFormData({ ...formData, chapters: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="topics">Specific Topics to Focus (Optional)</Label>
          <Input
            id="topics"
            placeholder="e.g., Factorization, Graphs"
            value={formData.topics}
            onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Additional Instructions</Label>
          <Textarea
            id="instructions"
            placeholder="Any specific requirements or instructions..."
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="syllabus">Upload Syllabus (Optional)</Label>
          <div className="flex items-center gap-4">
            <Input
              id="syllabus"
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="flex-1"
            />
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-5 w-5" />
              Generate Question Paper
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
