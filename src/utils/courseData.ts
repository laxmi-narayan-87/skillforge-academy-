import type { Course } from "@/components/CourseList";

export const fetchTopCourses = async (topic: string): Promise<Course[]> => {
  const normalized = topic.toLowerCase();

  if (normalized.includes("devops")) {
    return [
      {
        id: "docker",
        title: "Docker Get Started",
        platform: "Docker Documentation",
        url: "https://docs.docker.com/get-started/",
      },
      {
        id: "kubernetes",
        title: "Kubernetes Basics",
        platform: "Kubernetes Documentation",
        url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
      },
      {
        id: "aws-devops",
        title: "DevOps Learning Plan",
        platform: "AWS Skill Builder",
        url: "https://explore.skillbuilder.aws/learn/public/learning_plan/view/82/devops-engineer",
      },
    ];
  }

  if (normalized.includes("mobile")) {
    return [
      {
        id: "react-native",
        title: "React Native Documentation",
        platform: "React Native",
        url: "https://reactnative.dev/docs/getting-started",
      },
      {
        id: "flutter",
        title: "Flutter Learning Path",
        platform: "Flutter",
        url: "https://docs.flutter.dev/get-started/learn",
      },
      {
        id: "android",
        title: "Android Basics with Compose",
        platform: "Android Developers",
        url: "https://developer.android.com/courses/android-basics-compose/course",
      },
    ];
  }

  if (normalized.includes("frontend") || normalized.includes("react")) {
    return [
      {
        id: "mdn",
        title: "MDN Web Development",
        platform: "MDN",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
      },
      {
        id: "react",
        title: "React Learn",
        platform: "React",
        url: "https://react.dev/learn",
      },
      {
        id: "javascript",
        title: "The Modern JavaScript Tutorial",
        platform: "JavaScript.info",
        url: "https://javascript.info/",
      },
    ];
  }

  if (normalized.includes("backend")) {
    return [
      {
        id: "node",
        title: "Node.js Learn",
        platform: "Node.js",
        url: "https://nodejs.org/en/learn",
      },
      {
        id: "fastapi",
        title: "FastAPI Tutorial",
        platform: "FastAPI",
        url: "https://fastapi.tiangolo.com/tutorial/",
      },
      {
        id: "postgres",
        title: "PostgreSQL Tutorial",
        platform: "PostgreSQL",
        url: "https://www.postgresql.org/docs/current/tutorial.html",
      },
    ];
  }

  return [
    {
      id: "cs50",
      title: "CS50x",
      platform: "Harvard / edX",
      url: "https://cs50.harvard.edu/x/",
    },
    {
      id: "freecodecamp",
      title: "freeCodeCamp Curriculum",
      platform: "freeCodeCamp",
      url: "https://www.freecodecamp.org/learn/",
    },
    {
      id: "roadmap",
      title: "Developer Roadmaps",
      platform: "roadmap.sh",
      url: "https://roadmap.sh/",
    },
  ];
};
