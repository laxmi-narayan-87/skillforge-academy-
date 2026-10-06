import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

interface RoadmapInput {
  skillLevel: string;
  careerGoal: string;
  learningStyle: string;
}

const RoadmapSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string().min(1),
      topics: z.array(z.string().min(1)).min(1),
    })
  ).min(1),
  resources: z.array(
    z.object({
      title: z.string().min(1),
      url: z.string().url(),
      type: z.enum(["documentation", "course", "tutorial", "guide"]),
    })
  ).optional().default([]),
});

const getDemoRoadmap = (input: RoadmapInput) => ({
  sections: [
    {
      title: "Getting Started",
      topics: [
        "Basic Concepts",
        "Development Environment Setup",
        "Version Control Basics",
      ],
    },
    {
      title: "Core Skills",
      topics: [
        \`\${input.skillLevel} Level Programming\`,
        "Problem Solving",
        "Data Structures",
      ],
    },
    {
      title: "Advanced Topics",
      topics: [
        "System Design",
        "Best Practices",
        "Industry Standards",
      ],
    },
  ],
  resources: [],
});

const extractJson = (content: string) => {
  const trimmed = content.trim();
  const fenced = trimmed.match(/\`\`\`(?:json)?\s*([\s\S]*?)\s*\`\`\`/i);
  return fenced?.[1] ?? trimmed;
};

export const generateRoadmap = async (input: RoadmapInput) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("No Gemini API key found, using curated fallback roadmap.");
    return getDemoRoadmap(input);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = \`Create a detailed learning roadmap for a \${input.skillLevel} level student interested in \${input.careerGoal}.
They prefer \${input.learningStyle} learning style.
Return only valid JSON matching this structure:
{
  "sections": [
    { "title": "string", "topics": ["string"] }
  ],
  "resources": [
    { "title": "string", "url": "https://...", "type": "documentation|course|tutorial|guide" }
  ]
}\`;

  const result = await model.generateContent(prompt);
  const content = (await result.response).text();

  if (!content) {
    throw new Error("Gemini returned an empty response.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(extractJson(content));
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }

  const parsed = RoadmapSchema.safeParse(parsedJson);
  if (!parsed.success) {
    console.error("Invalid Gemini roadmap schema:", parsed.error.flatten());
    throw new Error("Gemini returned an invalid roadmap format.");
  }

  return parsed.data;
};
