import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Loader2 } from "lucide-react";
import { generateRoadmap } from "@/utils/aiUtils";
import { UserPreferences } from "@/types/user";
import { useRoadmapNavigation } from "@/hooks/useRoadmapNavigation";
import { useToast } from "@/hooks/use-toast";
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
    setIsGenerating(true);

    try {
      const roadmap = await generateRoadmap(formData);
      toast({
        title: "Roadmap Generated! 🎉",
        description: "Your personalized learning path has been generated.",
        duration: 5000,
      });
      
      navigateToRoadmap(formData.careerGoal);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast({
        title: "Error",
        description: "Failed to generate roadmap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <SkillLevelSection
          value={formData.skillLevel}
          onChange={(value) => setFormData({ ...formData, skillLevel: value })}
        />

        <CareerGoalSection
          value={formData.careerGoal}
          onChange={(value) => setFormData({ ...formData, careerGoal: value })}
        />

        <LearningStyleSection
          value={formData.learningStyle as "visual" | "practical" | "theoretical"}
          onChange={(value) => setFormData({ ...formData, learningStyle: value })}
        />

        <Button type="submit" disabled={isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Roadmap...
            </>
          ) : (
            "Generate Personalized Roadmap"
          )}
        </Button>
      </form>
    </Card>
  );
};

export default AIRoadmapGenerator;