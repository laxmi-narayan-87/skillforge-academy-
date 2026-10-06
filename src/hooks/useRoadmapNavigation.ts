import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export const useRoadmapNavigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const navigateToRoadmap = (roadmapId: string) => {
    if (!roadmapId) {
      toast({
        title: "Roadmap unavailable",
        description: "Please enter a valid career goal.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/roadmap/${encodeURIComponent(roadmapId)}`);
  };

  return { navigateToRoadmap };
};