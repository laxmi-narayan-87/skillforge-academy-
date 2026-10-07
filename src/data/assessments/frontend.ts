export interface FrontendAssessmentQuestion {
  id: number;
  topic: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export const frontendAssessment: FrontendAssessmentQuestion[] = [
  {
    id: 1,
    topic: "Web Fundamentals",
    text: "What does HTTP primarily define?",
    options: [
      "How browsers and servers communicate",
      "How CSS selectors are written",
      "How databases store rows",
      "How CPUs execute instructions",
    ],
    correctAnswer: 0,
  },
  {
    id: 2,
    topic: "HTML",
    text: "Which HTML element is intended for the primary content of a page?",
    options: ["<section>", "<main>", "<content>", "<primary>"],
    correctAnswer: 1,
  },
  {
    id: 3,
    topic: "CSS",
    text: "Which CSS layout system is designed for two-dimensional rows and columns?",
    options: ["Flexbox", "Float", "CSS Grid", "Positioning"],
    correctAnswer: 2,
  },
  {
    id: 4,
    topic: "JavaScript",
    text: "Which keyword creates a block-scoped variable that can be reassigned?",
    options: ["var", "let", "const", "static"],
    correctAnswer: 1,
  },
  {
    id: 5,
    topic: "JavaScript",
    text: "What does Promise.all() do?",
    options: [
      "Runs promises one at a time",
      "Resolves when every supplied promise resolves, or rejects if one rejects",
      "Converts callbacks into promises automatically",
      "Retries failed promises forever",
    ],
    correctAnswer: 1,
  },
  {
    id: 6,
    topic: "React",
    text: "What is the main purpose of a React key when rendering a list?",
    options: [
      "To encrypt list data",
      "To identify elements between renders",
      "To add CSS classes",
      "To make every element globally unique",
    ],
    correctAnswer: 1,
  },
  {
    id: 7,
    topic: "React",
    text: "Which hook is commonly used to store component-local state?",
    options: ["useEffect", "useMemo", "useState", "useRef"],
    correctAnswer: 2,
  },
  {
    id: 8,
    topic: "Web Performance",
    text: "Which technique can reduce the initial JavaScript sent to the browser?",
    options: [
      "Code splitting",
      "Adding more global CSS",
      "Disabling caching",
      "Duplicating dependencies",
    ],
    correctAnswer: 0,
  },
  {
    id: 9,
    topic: "Accessibility",
    text: "Which attribute provides an accessible name for an image when the image conveys information?",
    options: ["title", "alt", "name", "label"],
    correctAnswer: 1,
  },
  {
    id: 10,
    topic: "Testing",
    text: "What should a frontend unit test primarily verify?",
    options: [
      "A small unit of behavior in isolation",
      "The entire production infrastructure",
      "The user's internet speed",
      "Every browser at the same time",
    ],
    correctAnswer: 0,
  },
];
