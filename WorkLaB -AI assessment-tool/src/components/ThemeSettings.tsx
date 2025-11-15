import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Loader2, Save, Palette, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ThemeSettings {
  background_color: string;
  template_color: string;
  logo_color: string;
  button_colors: Record<string, string>;
}

export function ThemeSettings() {
  const [settings, setSettings] = useState<ThemeSettings>({
    background_color: "hsl(0 0% 100%)",
    template_color: "hsl(0 0% 100%)",
    logo_color: "hsl(221.2 83.2% 53.3%)",
    button_colors: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedButton, setSelectedButton] = useState<string>("");
  const [newButtonName, setNewButtonName] = useState("");
  const [newButtonColor, setNewButtonColor] = useState("#3b82f6");

  const buttonList = [
    "primary-button",
    "secondary-button",
    "submit-button",
    "cancel-button",
    "save-button",
    "delete-button",
    ...Object.keys(settings.button_colors),
  ];

  useEffect(() => {
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("theme_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setSettings({
          background_color: data.background_color,
          template_color: data.template_color,
          logo_color: data.logo_color,
          button_colors: (data.button_colors as Record<string, string>) || {},
        });
      }
    } catch (error: any) {
      console.error("Error loading theme settings:", error);
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
        .from("theme_settings")
        .upsert({
          user_id: user.id,
          background_color: settings.background_color,
          template_color: settings.template_color,
          logo_color: settings.logo_color,
          button_colors: settings.button_colors,
        });

      if (error) throw error;

      // Apply theme to CSS variables
      document.documentElement.style.setProperty("--background", settings.background_color);
      document.documentElement.style.setProperty("--card", settings.template_color);
      document.documentElement.style.setProperty("--primary", settings.logo_color);

      toast.success("Theme settings saved!");
    } catch (error: any) {
      console.error("Error saving theme settings:", error);
      toast.error("Failed to save theme settings");
    } finally {
      setIsSaving(false);
    }
  };

  const hexToHsl = (hex: string): string => {
    // Remove the hash if present
    hex = hex.replace(/^#/, "");
    
    // Parse hex to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `hsl(${h} ${s}% ${l}%)`;
  };

  const addButtonColor = () => {
    if (newButtonName && newButtonColor) {
      setSettings({
        ...settings,
        button_colors: {
          ...settings.button_colors,
          [newButtonName]: hexToHsl(newButtonColor),
        },
      });
      setNewButtonName("");
      setNewButtonColor("#3b82f6");
      toast.success(`Color added for ${newButtonName}`);
    }
  };

  const removeButtonColor = (buttonName: string) => {
    const { [buttonName]: _, ...rest } = settings.button_colors;
    setSettings({ ...settings, button_colors: rest });
    toast.success(`Removed color for ${buttonName}`);
  };

  if (isLoading) {
    return (
      <Card className="p-6 shadow-soft flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Theme Customization</h3>
      </div>

      <div className="space-y-6">
        {/* Background Color */}
        <div className="space-y-2">
          <Label htmlFor="bg-color">Background Color</Label>
          <div className="flex gap-2">
            <Input
              id="bg-color"
              type="color"
              value={settings.background_color.match(/#[0-9a-f]{6}/i)?.[0] || "#ffffff"}
              onChange={(e) => setSettings({ ...settings, background_color: hexToHsl(e.target.value) })}
              className="w-20 h-10"
            />
            <Input
              value={settings.background_color}
              onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
              placeholder="hsl(0 0% 100%)"
              className="flex-1"
            />
          </div>
        </div>

        {/* Template Color */}
        <div className="space-y-2">
          <Label htmlFor="template-color">Template Color</Label>
          <div className="flex gap-2">
            <Input
              id="template-color"
              type="color"
              value={settings.template_color.match(/#[0-9a-f]{6}/i)?.[0] || "#ffffff"}
              onChange={(e) => setSettings({ ...settings, template_color: hexToHsl(e.target.value) })}
              className="w-20 h-10"
            />
            <Input
              value={settings.template_color}
              onChange={(e) => setSettings({ ...settings, template_color: e.target.value })}
              placeholder="hsl(0 0% 100%)"
              className="flex-1"
            />
          </div>
        </div>

        {/* Logo Color */}
        <div className="space-y-2">
          <Label htmlFor="logo-color">Logo Color</Label>
          <div className="flex gap-2">
            <Input
              id="logo-color"
              type="color"
              value={settings.logo_color.match(/#[0-9a-f]{6}/i)?.[0] || "#3b82f6"}
              onChange={(e) => setSettings({ ...settings, logo_color: hexToHsl(e.target.value) })}
              className="w-20 h-10"
            />
            <Input
              value={settings.logo_color}
              onChange={(e) => setSettings({ ...settings, logo_color: e.target.value })}
              placeholder="hsl(221.2 83.2% 53.3%)"
              className="flex-1"
            />
          </div>
        </div>

        {/* Button Colors */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold">Button Colors</h4>
          
          {/* Add New Button Color */}
          <div className="space-y-2 p-4 rounded-lg bg-muted/30 border">
            <Label>Add Custom Button Color</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Button name (e.g., custom-button)"
                value={newButtonName}
                onChange={(e) => setNewButtonName(e.target.value)}
                className="flex-1"
              />
              <Input
                type="color"
                value={newButtonColor}
                onChange={(e) => setNewButtonColor(e.target.value)}
                className="w-20 h-10"
              />
              <Button onClick={addButtonColor} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Existing Button Colors */}
          <div className="space-y-2">
            {Object.entries(settings.button_colors).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2 p-3 rounded-lg bg-muted/20">
                <span className="flex-1 font-medium">{name}</span>
                <Input
                  type="color"
                  value={color.match(/#[0-9a-f]{6}/i)?.[0] || "#3b82f6"}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      button_colors: {
                        ...settings.button_colors,
                        [name]: hexToHsl(e.target.value),
                      },
                    });
                  }}
                  className="w-20 h-10"
                />
                <Input
                  value={color}
                  onChange={(e) => {
                    setSettings({
                      ...settings,
                      button_colors: {
                        ...settings.button_colors,
                        [name]: e.target.value,
                      },
                    });
                  }}
                  className="w-40"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeButtonColor(name)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gradient-primary"
          size="lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving Theme...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Save Theme Settings
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
