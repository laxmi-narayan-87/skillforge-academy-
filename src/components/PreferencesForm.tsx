import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { UserPreferences } from "@/types/user";

const defaults: UserPreferences = { learningStyle: "visual", hoursPerWeek: 5, goals: [] };

const PreferencesForm = ({ onSave, initialPreferences }: { onSave: (preferences: UserPreferences) => void | Promise<void>; initialPreferences?: UserPreferences }) => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences || defaults);

  useEffect(() => {
    if (initialPreferences) setPreferences(initialPreferences);
  }, [initialPreferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(preferences);
    toast({ title: "Preferences saved", description: "Your learning preferences have been updated." });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Learning Style</h3>
        <RadioGroup value={preferences.learningStyle} onValueChange={(value: UserPreferences["learningStyle"]) => setPreferences({ ...preferences, learningStyle: value })}>
          {(["visual", "practical", "theoretical"] as const).map((style) => (
            <div className="flex items-center space-x-2" key={style}>
              <RadioGroupItem value={style} id={style} />
              <Label htmlFor={style}>{style === "visual" ? "Visual Learning" : style === "practical" ? "Practical Exercises" : "Theoretical Study"}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor="hoursPerWeek">Hours per week for learning</Label>
        <Input id="hoursPerWeek" type="number" min="1" max="40" value={preferences.hoursPerWeek} onChange={(e) => setPreferences({ ...preferences, hoursPerWeek: Math.min(40, Math.max(1, Number(e.target.value) || 1)) })} />
      </div>
      <Button type="submit">Save Preferences</Button>
    </form>
  );
};

export default PreferencesForm;