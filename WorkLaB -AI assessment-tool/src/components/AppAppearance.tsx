import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Smartphone, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const highlightColors = [
  { name: "Blue", value: "220 70% 50%", hex: "#3B82F6" },
  { name: "Purple", value: "263 70% 50%", hex: "#9333EA" },
  { name: "Pink", value: "330 70% 50%", hex: "#EC4899" },
  { name: "Red", value: "0 70% 50%", hex: "#EF4444" },
  { name: "Orange", value: "25 95% 53%", hex: "#F97316" },
  { name: "Yellow", value: "45 93% 47%", hex: "#EAB308" },
  { name: "Green", value: "142 76% 36%", hex: "#22C55E" },
  { name: "Teal", value: "173 80% 40%", hex: "#14B8A6" },
];

const fonts = [
  { name: "System", value: "system" },
  { name: "Inter", value: "inter" },
  { name: "Roboto", value: "roboto" },
  { name: "Open Sans", value: "open-sans" },
];

const animationSpeeds = [
  { name: "Normal", value: "normal" },
  { name: "Fast", value: "fast" },
  { name: "Slow", value: "slow" },
  { name: "None", value: "none" },
];

const pageTransitions = [
  { name: "Fade", value: "fade" },
  { name: "Slide", value: "slide" },
  { name: "Scale", value: "scale" },
  { name: "None", value: "none" },
];

export function AppAppearance() {
  const { theme, setTheme } = useTheme();
  const [selectedColor, setSelectedColor] = useState<string>("263 70% 50%");
  const [font, setFont] = useState("system");
  const [animationSpeed, setAnimationSpeed] = useState("normal");
  const [pageTransition, setPageTransition] = useState("fade");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved preferences
    const savedColor = localStorage.getItem("highlight-color");
    const savedFont = localStorage.getItem("app-font");
    const savedSpeed = localStorage.getItem("animation-speed");
    const savedTransition = localStorage.getItem("page-transition");
    
    if (savedColor) setSelectedColor(savedColor);
    if (savedFont) setFont(savedFont);
    if (savedSpeed) setAnimationSpeed(savedSpeed);
    if (savedTransition) setPageTransition(savedTransition);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Apply color to CSS variables
    const root = document.documentElement;
    root.style.setProperty("--primary", selectedColor);
    root.style.setProperty("--ring", selectedColor);
    localStorage.setItem("highlight-color", selectedColor);
  }, [selectedColor, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("app-font", font);
    // Apply font
    const root = document.documentElement;
    if (font === "system") {
      root.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    } else if (font === "inter") {
      root.style.fontFamily = "'Inter', sans-serif";
    } else if (font === "roboto") {
      root.style.fontFamily = "'Roboto', sans-serif";
    } else if (font === "open-sans") {
      root.style.fontFamily = "'Open Sans', sans-serif";
    }
  }, [font, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("animation-speed", animationSpeed);
    const root = document.documentElement;
    if (animationSpeed === "fast") {
      root.style.setProperty("--animation-duration", "0.15s");
    } else if (animationSpeed === "slow") {
      root.style.setProperty("--animation-duration", "0.5s");
    } else if (animationSpeed === "none") {
      root.style.setProperty("--animation-duration", "0s");
    } else {
      root.style.setProperty("--animation-duration", "0.3s");
    }
  }, [animationSpeed, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("page-transition", pageTransition);
  }, [pageTransition, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Theme Section */}
      <Card className="p-6 shadow-soft">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
              Theme
            </Label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "relative p-6 rounded-xl border-2 transition-all hover:scale-[1.02]",
                theme === "light" 
                  ? "border-primary bg-primary/5" 
                  : "border-border bg-card hover:border-muted-foreground/30"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-20 h-40 bg-background border-4 border-foreground/20 rounded-2xl flex items-center justify-center">
                      <Sun className="h-8 w-8 text-foreground" />
                    </div>
                    {theme === "light" && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-center font-medium">Light</p>
              </div>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "relative p-6 rounded-xl border-2 transition-all hover:scale-[1.02]",
                theme === "dark" 
                  ? "border-primary bg-primary/5" 
                  : "border-border bg-card hover:border-muted-foreground/30"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-20 h-40 bg-foreground border-4 border-foreground/20 rounded-2xl flex items-center justify-center">
                      <Moon className="h-8 w-8 text-background" />
                    </div>
                    {theme === "dark" && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-center font-medium">Dark</p>
              </div>
            </button>
          </div>
        </div>
      </Card>

      {/* Highlight Color */}
      <Card className="p-6 shadow-soft">
        <div className="space-y-4">
          <Label className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
            Highlight Color
          </Label>
          
          <div className="flex gap-3 flex-wrap">
            {highlightColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={cn(
                  "relative w-12 h-12 rounded-full transition-all hover:scale-110",
                  selectedColor === color.value && "ring-4 ring-offset-2 ring-primary/50"
                )}
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
              >
                {selectedColor === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Text Settings */}
      <Card className="p-6 shadow-soft">
        <div className="space-y-4">
          <Label className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
            Text
          </Label>
          
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Label className="text-base">Font</Label>
            </div>
            <div className="flex items-center gap-2">
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger className="w-[140px] border-0 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </Card>

      {/* Animation Settings */}
      <Card className="p-6 shadow-soft">
        <div className="space-y-4">
          <Label className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
            Animation
          </Label>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Label className="text-base">Page Transition</Label>
              </div>
              <div className="flex items-center gap-2">
                <Select value={pageTransition} onValueChange={setPageTransition}>
                  <SelectTrigger className="w-[140px] border-0 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageTransitions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Label className="text-base">Animation Speed</Label>
              </div>
              <div className="flex items-center gap-2">
                <Select value={animationSpeed} onValueChange={setAnimationSpeed}>
                  <SelectTrigger className="w-[140px] border-0 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {animationSpeeds.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
