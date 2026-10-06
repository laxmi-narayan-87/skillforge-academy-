import Hero from "../components/Hero";
import RoadmapCategories from "../components/RoadmapCategories";
import AIRoadmapGenerator from "../components/AIRoadmapGenerator";
import { useUserProgress } from "@/hooks/useUserProgress";

const Index = () => {
  const { preferences } = useUserProgress();

  return (
    <div className="min-h-screen">
      <Hero />

      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-bold mb-6">Generate Your Personal Learning Path</h2>
            <AIRoadmapGenerator initialPreferences={preferences} />
          </div>
        </div>

        <RoadmapCategories />
      </main>
    </div>
  );
};

export default Index;
