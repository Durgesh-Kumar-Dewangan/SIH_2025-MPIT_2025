import { useState } from "react";
import { Brain, FileText, TrendingUp, Settings, LayoutDashboard, User, Globe, Code } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  pageTitle: string;
  pageSubtitle?: string;
}

export function DashboardLayout({
  children,
  currentView,
  onViewChange,
  pageTitle,
  pageSubtitle,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState<"normal" | "large">("normal");
  const [dyslexiaFont, setDyslexiaFont] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "assessments", label: "Assessments", icon: FileText },
    { id: "hosted", label: "Hosted Exams", icon: Globe },
    { id: "lab-work", label: "Lab Work", icon: Code },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className={`flex min-h-screen ${fontSize === "large" ? "text-lg" : ""} ${dyslexiaFont ? "font-[OpenDyslexic]" : ""}`}>
      {/* Sidebar */}
      <aside className="w-[230px] bg-sidebar-bg border-r border-sidebar-border p-6 hidden md:flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-7 w-7 text-primary" />
            <h2 className="text-2xl font-bold">Worklab</h2>
          </div>
          <p className="text-muted-foreground text-sm mb-6">AI-Powered Learning</p>
          
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  currentView === item.id
                    ? "bg-nav-active text-primary font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-foreground hover:bg-muted"
            >
              <User className="h-4 w-4" />
              Profile
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{pageTitle}</h1>
              {pageSubtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{pageSubtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFontSize(fontSize === "normal" ? "large" : "normal")}
              >
                Font: {fontSize === "normal" ? "Normal" : "Large"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDyslexiaFont(!dyslexiaFont)}
              >
                Dyslexia: {dyslexiaFont ? "On" : "Off"}
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
