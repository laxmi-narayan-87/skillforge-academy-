import { useParams, Link, useNavigate } from "react-router-dom";
import { useRoadmap } from "@/hooks/useRoadmaps";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateRoadmap } from "@/utils/aiUtils";
import { fetchTopCourses } from "@/utils/courseData";
import RoadmapHeader from "@/components/roadmap/RoadmapHeader";
import RoadmapProgress from "@/components/roadmap/RoadmapProgress";
import RoadmapContent from "@/components/roadmap/RoadmapContent";
import RoadmapHero from "@/components/roadmap/RoadmapHero";
import { Flowchart } from "@/components/Flowchart";

const RoadmapView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: roadmap, isLoading, error } = useRoadmap(id || "");
  const { progress, preferences, updatePreferences } = useUserProgress(roadmap?.id);
  const { toast } = useToast();

  const { data: topCourses } = useQuery({
    queryKey: ["courses", roadmap?.title],
    queryFn: () => fetchTopCourses(roadmap?.title || ""),
    enabled: !!roadmap?.title,
  });

  const handleRegenerateRoadmap = async () => {
    if (!roadmap) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", description: "You must be logged in to regenerate roadmaps.", variant: "destructive" });
      return;
    }

    try {
      const newRoadmap = await generateRoadmap({
        skillLevel: progress.currentLevel || "beginner",
        careerGoal: roadmap.title,
        learningStyle: preferences.learningStyle || "visual",
      });

      if (roadmap.id !== id && !roadmap.id) throw new Error("Invalid roadmap.");
      const { error: updateError } = await supabase
        .from("roadmaps")
        .update({
          sections: newRoadmap.sections,
          description: `Personalized ${progress.currentLevel || "beginner"} roadmap for ${roadmap.title}.`,
        })
        .eq("id", roadmap.id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      await queryClient.invalidateQueries({ queryKey: ["roadmap", roadmap.id] });
      toast({ title: "Roadmap Regenerated!", description: "Your learning path has been updated." });
    } catch (error) {
      console.error("Error regenerating roadmap:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to regenerate roadmap.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>;

  if (error || !roadmap) {
    return <div className="flex flex-col items-center justify-center min-h-screen"><h1 className="text-2xl font-bold mb-4">Roadmap not found</h1><Link to="/" className="text-primary hover:underline">Return to homepage</Link></div>;
  }

  const totalTopics = roadmap.sections.reduce((acc, section) => acc + section.topics.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <RoadmapHeader title={roadmap.title} description={roadmap.description} onRegenerate={handleRegenerateRoadmap} />
      <RoadmapHero id={roadmap.id} title={roadmap.title} description={roadmap.description} />
      <RoadmapProgress completedTopics={progress.completedTopics} totalTopics={totalTopics} />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Learning Path</h2>
          <Flowchart sections={roadmap.sections} topicQuestions={roadmap.topicQuestions} roadmapId={roadmap.id} />
        </div>
      </div>
      <RoadmapContent resources={roadmap.resources} topCourses={topCourses || []} preferences={preferences} onUpdatePreferences={updatePreferences} />
    </div>
  );
};

export default RoadmapView;