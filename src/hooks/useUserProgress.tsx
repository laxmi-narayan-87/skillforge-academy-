import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { UserProgress, UserPreferences } from "@/types/user";


const defaultPreferences: UserPreferences = {
  learningStyle: "visual",
  hoursPerWeek: 5,
  goals: [],
};

export const useUserProgress = (roadmapId?: string) => {
  const [progress, setProgress] = useState<UserProgress>({
    completedTopics: [],
    currentLevel: "beginner",
    interests: [],
    lastActivity: new Date(),
  });

  const progressRef = useRef<UserProgress>(progress);
  const progressSaveQueue = useRef<Promise<void>>(Promise.resolve());

  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  const { toast } = useToast();

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

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
        setProgress(prev => ({
          ...prev,
          completedTopics: [],
          currentLevel: "beginner",
        }));
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
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchUserProgress = async () => {
      if (!roadmapId) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) {
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

      setProgress(prev => ({
        ...prev,
        completedTopics: data?.completed_topics ?? [],
      }));
    };

    fetchUserProgress();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setProgress(prev => ({ ...prev, completedTopics: [] }));
      } else if (event === "SIGNED_IN") {
        fetchUserProgress();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [roadmapId, toast]);


  const updatePreferences = async (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);

    const { data: { user } } = await supabase.auth.getUser();
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
    if (!roadmapId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Sign in to track progress",
        description: "Create an account or sign in before completing roadmap topics.",
      });
      return;
    }

    const saveProgress = async () => {
      const currentTopics = progressRef.current.completedTopics;
      if (currentTopics.includes(topicId)) return;

      const nextProgress: UserProgress = {
        ...progressRef.current,
        completedTopics: [...currentTopics, topicId],
        lastActivity: new Date(),
      };
      const { error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: user.id,
          roadmap_id: roadmapId,
          completed_topics: nextProgress.completedTopics,
        }, {
          onConflict: "user_id,roadmap_id",
        });

      if (error) {
        console.error("Error saving progress:", error);
        toast({
          title: "Error saving progress",
          description: "Your change could not be saved. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update the ref synchronously so queued topic completions build on the
      // latest successfully persisted state, not a stale React render.
      progressRef.current = nextProgress;
      setProgress(nextProgress);
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
