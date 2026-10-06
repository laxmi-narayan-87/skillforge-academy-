import { Card } from "@/components/ui/card";

interface RoadmapProgressProps {
  completedTopics: string[];
  totalTopics: number;
}

const RoadmapProgress = ({ completedTopics, totalTopics }: RoadmapProgressProps) => {
  const progressPercentage = totalTopics > 0
    ? Math.min(100, Math.round((completedTopics.length / totalTopics) * 100))
    : 0;

  return (
    <Card className="p-4 w-64">
      <div className="text-sm text-gray-600 mb-2">Progress</div>
      <div className="text-2xl font-bold mb-2">{progressPercentage}%</div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </Card>
  );
};

export default RoadmapProgress;
