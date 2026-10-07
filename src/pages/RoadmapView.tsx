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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClipboardCheck, ArrowRight } from "lucide-react";

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
          resources: newRoadmap.resources ?? [],
          topic_questions: {},
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

      {roadmap.id === "frontend" && (
        <div className="container mx-auto pb-2">
          <Card className="border-primary/20 bg-primary/5 p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Test your Frontend skills</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Take the 10-question assessment to check your HTML, CSS, JavaScript, React, accessibility, performance, and testing fundamentals.
                  </p>
                </div>
              </div>
              <Button asChild className="shrink-0">
                <Link to="/assessment/frontend">
                  Start Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      )}

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