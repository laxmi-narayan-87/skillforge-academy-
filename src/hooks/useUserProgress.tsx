import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { UserProgress, UserPreferences } from "@/types/user";

const defaultPreferences: UserPreferences = {
  learningStyle: "visual",
  hoursPerWeek: 5,
  goals: [],
};

const createInitialProgress = (): UserProgress => ({
  completedTopics: [],
  currentLevel: "beginner",
  interests: [],
  lastActivity: new Date(),
});

export const useUserProgress = (roadmapId?: string) => {
  const [progress, setProgress] = useState<UserProgress>(createInitialProgress);
  const progressRef = useRef<UserProgress>(progress);
  const activeRoadmapId = useRef(roadmapId);
  const completedTopicsByRoadmap = useRef(new Map<string, string[]>());
  const progressSaveQueue = useRef<Promise<void>>(Promise.resolve());

  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const { toast } = useToast();

  const resetProgress = useCallback(() => {
    completedTopicsByRoadmap.current.clear();
    const nextProgress = createInitialProgress();
    progressRef.current = nextProgress;
    setProgress(nextProgress);
    setPreferences(defaultPreferences);
  }, []);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    activeRoadmapId.current = roadmapId;
  }, [roadmapId]);

  useEffect(() => {
    let mounted = true;

    const loadUserSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted || !user) return;

      const metadata = user.user_metadata ?? {};
      if (metadata.preferences) {
        setPreferences({ ...defaultPreferences, ...metadata.preferences });
      }

      if (
        metadata.skillLevel === "beginner" ||
        metadata.skillLevel === "intermediate" ||
        metadata.skillLevel === "advanced"
      ) {
        setProgress(prev => ({ ...prev, currentLevel: metadata.skillLevel }));
      }
    };

    loadUserSettings();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        resetProgress();
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        const metadata = session?.user?.user_metadata ?? {};
        if (metadata.preferences) {
          setPreferences({ ...defaultPreferences, ...metadata.preferences });
        }
        if (
          metadata.skillLevel === "beginner" ||
          metadata.skillLevel === "intermediate" ||
          metadata.skillLevel === "advanced"
        ) {
          setProgress(prev => ({ ...prev, currentLevel: metadata.skillLevel }));
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [resetProgress]);

  useEffect(() => {
    let mounted = true;

    const fetchUserProgress = async () => {
      if (!roadmapId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        completedTopicsByRoadmap.current.delete(roadmapId);
        if (mounted && activeRoadmapId.current === roadmapId) {
          setProgress(prev => ({ ...prev, completedTopics: [] }));
        }
        return;
      }

      const { data, error } = await supabase
        .from("user_progress")
        .select("completed_topics")
        .eq("roadmap_id", roadmapId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Error fetching progress:", error);
        toast({
          title: "Error fetching progress",
          description: "There was an error loading your progress.",
          variant: "destructive",
        });
        return;
      }

      const completedTopics = data?.completed_topics ?? [];
      completedTopicsByRoadmap.current.set(roadmapId, completedTopics);
      if (activeRoadmapId.current === roadmapId) {
        setProgress(prev => ({ ...prev, completedTopics }));
      }
    };

    fetchUserProgress();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        resetProgress();
      } else if (event === "SIGNED_IN") {
        fetchUserProgress();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [roadmapId, resetProgress, toast]);

  const updatePreferences = async (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);

    const { error } = await supabase.auth.updateUser({
      data: { preferences: newPreferences },
    });

    if (error) {
      toast({
        title: "Could not save preferences",
        description: "Your preferences were updated locally but could not be synced.",
        variant: "destructive",
      });
    }
  };

  const updateSkillLevel = async (level: "beginner" | "intermediate" | "advanced") => {
    setProgress(prev => ({
      ...prev,
      currentLevel: level,
      lastActivity: new Date(),
    }));

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.auth.updateUser({
      data: { skillLevel: level },
    });

    if (error) {
      toast({
        title: "Could not save skill level",
        description: "The level was updated locally but could not be synced.",
        variant: "destructive",
      });
    }
  };

  const markTopicComplete = async (topicId: string) => {
    const targetRoadmapId = roadmapId;
    if (!targetRoadmapId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Sign in to track progress",
        description: "Create an account or sign in before completing roadmap topics.",
      });
      return;
    }

    const saveProgress = async () => {
      try {
        let currentTopics = completedTopicsByRoadmap.current.get(targetRoadmapId);
        if (currentTopics === undefined) {
          const { data, error } = await supabase
            .from("user_progress")
            .select("completed_topics")
            .eq("user_id", user.id)
            .eq("roadmap_id", targetRoadmapId)
            .maybeSingle();

          if (error) throw error;
          currentTopics = data?.completed_topics ?? [];
        }

        if (currentTopics.includes(topicId)) {
          completedTopicsByRoadmap.current.set(targetRoadmapId, currentTopics);
          return;
        }

        const nextTopics = [...currentTopics, topicId];
        const { error } = await supabase
          .from("user_progress")
          .upsert({
            user_id: user.id,
            roadmap_id: targetRoadmapId,
            completed_topics: nextTopics,
          }, {
            onConflict: "user_id,roadmap_id",
          });

        if (error) throw error;

        // Do not let a delayed save from an old session repopulate the current UI.
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser?.id !== user.id) return;

        completedTopicsByRoadmap.current.set(targetRoadmapId, nextTopics);
        if (activeRoadmapId.current !== targetRoadmapId) return;

        const nextProgress: UserProgress = {
          ...progressRef.current,
          completedTopics: nextTopics,
          lastActivity: new Date(),
        };
        progressRef.current = nextProgress;
        setProgress(nextProgress);
      } catch (error) {
        console.error("Error saving progress:", error);
        toast({
          title: "Error saving progress",
          description: "Your change could not be saved. Please try again.",
          variant: "destructive",
        });
      }
    };

    progressSaveQueue.current = progressSaveQueue.current.then(saveProgress, saveProgress);
    await progressSaveQueue.current;
  };

  const getRecommendedContent = () => {
    const nextTopics = progress.completedTopics.length === 0
      ? ["html-basics", "css-fundamentals"]
      : ["javascript-basics", "react-introduction"];

    return {
      nextTopics,
      recommendedResources: preferences.learningStyle === "visual"
        ? ["video-tutorials", "interactive-demos"]
        : ["documentation", "practical-exercises"],
    };
  };

  return {
    progress,
    preferences,
    markTopicComplete,
    updatePreferences,
    updateSkillLevel,
    getRecommendedContent,
  };
};
