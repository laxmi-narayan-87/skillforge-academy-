import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { frontendRoadmap } from "../data/roadmaps/frontend";
import { backendRoadmap } from "../data/roadmaps/backend";
import { webscrapingRoadmap } from "../data/roadmaps/webscraping";
import { fullstackRoadmap } from "../data/roadmaps/fullstack";
import { devopsRoadmap } from "../data/roadmaps/devops";
import { mobileRoadmap } from "../data/roadmaps/mobile";
import { Json } from "@/integrations/supabase/types";

export interface AssessmentQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

export type TopicQuestions = Record<string, AssessmentQuestion[]>;

export interface Resource {
  title: string;
  url: string;
  type: "documentation" | "course" | "tutorial" | "guide";
}

export interface Section {
  title: string;
  topics: string[];
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  sections: Section[];
  resources: Resource[];
  topicQuestions?: TopicQuestions;
}

const staticRoadmaps: Roadmap[] = [
  frontendRoadmap,
  backendRoadmap,
  webscrapingRoadmap,
  fullstackRoadmap,
  devopsRoadmap,
  mobileRoadmap,
];

const staticRoadmapById = new Map(staticRoadmaps.map((roadmap) => [roadmap.id, roadmap]));

const isSection = (section: unknown): section is Section => {
  if (typeof section !== "object" || section === null) return false;
  const s = section as { title?: unknown; topics?: unknown };
  return typeof s.title === "string" &&
    Array.isArray(s.topics) &&
    s.topics.every((topic) => typeof topic === "string");
};

const isSectionArray = (sections: unknown): sections is Section[] => {
  return Array.isArray(sections) && sections.every(isSection);
};

const parseSections = (jsonSections: Json): Section[] => {
  if (!isSectionArray(jsonSections)) {
    console.error("Invalid sections format:", jsonSections);
    return [];
  }
  return jsonSections;
};

const getRoadmapData = async (id: string): Promise<Roadmap | null> => {
  const staticRoadmap = staticRoadmapById.get(id);
  if (staticRoadmap) return staticRoadmap;

  const { data, error } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (data) {
    return {
      id: data.id,
      title: data.title,
      description: data.description || "",
      sections: parseSections(data.sections),
      resources: Array.isArray(data.resources)
        ? data.resources as unknown as Resource[]
        : [],
      topicQuestions: data.topic_questions as unknown as TopicQuestions | undefined,
    };
  }

  // Backward compatibility for generated roadmaps created before stable IDs were used in URLs.
  const { data: legacyData, error: legacyError } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("title", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (legacyError) throw legacyError;
  if (!legacyData) return null;

  return {
    id: legacyData.id,
    title: legacyData.title,
    description: legacyData.description || "",
    sections: parseSections(legacyData.sections),
    resources: Array.isArray(legacyData.resources)
      ? legacyData.resources as unknown as Resource[]
      : [],
    topicQuestions: legacyData.topic_questions as unknown as TopicQuestions | undefined,
    };
};

export const useRoadmaps = () => {
  return useQuery({
    queryKey: ["roadmaps"],
    queryFn: async () => {
      const { data: dynamicRoadmaps, error } = await supabase
        .from("roadmaps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedDynamicRoadmaps: Roadmap[] = (dynamicRoadmaps || []).map((roadmap) => ({
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description || "",
        sections: parseSections(roadmap.sections),
        resources: Array.isArray(roadmap.resources)
          ? roadmap.resources as unknown as Resource[]
          : [],
        topicQuestions: roadmap.topic_questions as unknown as TopicQuestions | undefined,
      }));

      return {
        categories: {
          beginner: {
            title: "Learning Paths",
            description: "Curated roadmaps for different skill levels",
            roadmaps: [...transformedDynamicRoadmaps, ...staticRoadmaps],
          },
        },
        roadmaps: [...transformedDynamicRoadmaps, ...staticRoadmaps],
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useRoadmap = (id: string) => {
  return useQuery({
    queryKey: ["roadmap", id],
    queryFn: () => getRoadmapData(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
