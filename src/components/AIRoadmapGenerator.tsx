import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Loader2 } from "lucide-react";
import { generateRoadmap } from "@/utils/aiUtils";
import { UserPreferences } from "@/types/user";
import { useRoadmapNavigation } from "@/hooks/useRoadmapNavigation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SkillLevelSection from "./roadmap-generator/SkillLevelSection";
import LearningStyleSection from "./roadmap-generator/LearningStyleSection";
import CareerGoalSection from "./roadmap-generator/CareerGoalSection";

interface AIRoadmapGeneratorProps {
  initialPreferences?: UserPreferences;
}

const AIRoadmapGenerator = ({ initialPreferences }: AIRoadmapGeneratorProps) => {
  const { navigateToRoadmap } = useRoadmapNavigation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    skillLevel: "beginner",
    careerGoal: "",
    learningStyle: initialPreferences?.learningStyle || "visual",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const careerGoal = formData.careerGoal.trim();

    if (!careerGoal) {
      toast({ title: "Career goal required", description: "Enter the role or skill you want to learn.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Sign in required", description: "Sign in to save your personalized roadmap.", variant: "destructive" });
        return;
      }

      const roadmap = await generateRoadmap({ ...formData, careerGoal });

      const { data: inserted, error } = await supabase
        .from("roadmaps")
        .insert({
          title: careerGoal,
          description: `Personalized ${formData.skillLevel} roadmap for ${careerGoal}.`,
          sections: roadmap.sections,
          resources: roadmap.resources ?? [],
          topic_questions: {},
          user_id: user.id,
        })
        .select("id")
        .single();

      if (error || !inserted) throw error ?? new Error("Could not save the generated roadmap.");

      toast({ title: "Roadmap Generated! 🎉", description: "Your personalized learning path is ready." });
      navigateToRoadmap(inserted.id);
    } catch (error) {
      console.error("Error generating roadmap:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate roadmap.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <SkillLevelSection value={formData.skillLevel} onChange={(value) => setFormData({ ...formData, skillLevel: value })} />
        <CareerGoalSection value={formData.careerGoal} onChange={(value) => setFormData({ ...formData, careerGoal: value })} />
        <LearningStyleSection
          value={formData.learningStyle as "visual" | "practical" | "theoretical"}
          onChange={(value) => setFormData({ ...formData, learningStyle: value })}
        />
        <Button type="submit" disabled={isGenerating} className="w-full">
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Roadmap...</> : "Generate Personalized Roadmap"}
        </Button>
      </form>
    </Card>
  );
};

export default AIRoadmapGenerator;