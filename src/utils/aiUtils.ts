import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

interface RoadmapInput {
  skillLevel: "beginner" | "intermediate" | "advanced";
  careerGoal: string;
  learningStyle: string;
}

const RoadmapSchema = z.object({
  sections: z.array(z.object({
    title: z.string().trim().min(1).max(120),
    topics: z.array(z.string().trim().min(1).max(160)).min(1).max(20),
  })).min(1).max(12),
  resources: z.array(z.object({
    title: z.string().trim().min(1).max(160),
    url: z.string().url().refine((value) => {
      try { return new URL(value).protocol === "https:"; } catch { return false; }
    }, "Resource links must use HTTPS"),
    type: z.enum(["documentation", "course", "tutorial", "guide"]),
  })).max(30).optional().default([]),
});

const getDemoRoadmap = (input: RoadmapInput) => ({
  sections: [
    { title: "Getting Started", topics: ["Basic Concepts", "Development Environment Setup", "Version Control Basics"] },
    { title: "Core Skills", topics: [`${input.skillLevel} Level Programming`, "Problem Solving", "Data Structures"] },
    { title: "Advanced Topics", topics: ["System Design", "Best Practices", "Industry Standards"] },
  ],
  resources: [],
});

export const generateRoadmap = async (input: RoadmapInput) => {
  const safeInput = {
    skillLevel: input.skillLevel,
    careerGoal: input.careerGoal.trim().slice(0, 160),
    learningStyle: input.learningStyle.trim().slice(0, 80),
  };
  if (!safeInput.careerGoal) throw new Error("Please provide a career goal.");

  const { data, error } = await supabase.functions.invoke("generate-roadmap", {
    body: safeInput,
  });

  if (error) {
    console.error("Roadmap generation failed:", error);
    throw new Error("Could not generate a roadmap right now. Please try again later.");
  }

  const parsed = RoadmapSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Invalid roadmap response:", parsed.error.flatten());
    throw new Error("The roadmap service returned an invalid response.");
  }

  // This fallback is intentionally not automatic: API errors should be visible rather
  // than silently presenting a generic roadmap as if it were personalized.
  return parsed.data;
};

export { getDemoRoadmap };
