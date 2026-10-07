import { CheckCircle2, BookOpen, Lightbulb, Code, ClipboardCheck } from "lucide-react";
import { Handle, Position } from "@xyflow/react";

interface RoadmapNodeProps {
  data: {
    label: string;
    type?: "topic" | "resource";
    completed?: boolean;
    icon?: "tutorial" | "docs" | "project";
  };
  isConnectable: boolean;
}

const getResourceIcon = (icon?: string) => {
  switch (icon) {
    case "tutorial":
      return <Lightbulb className="text-yellow-300" size={20} />;
    case "docs":
      return <BookOpen className="text-blue-300" size={20} />;
    case "project":
      return <Code className="text-purple-300" size={20} />;
    default:
      return null;
  }
};

export const RoadmapNode = ({ data, isConnectable }: RoadmapNodeProps) => {
  const isTopic = data.type === "topic";
  const isResource = data.type === "resource";
  const isCompleted = Boolean(data.completed);

  return (
    <div
      className={[
        "px-5 py-4 shadow-lg rounded-xl border min-w-[250px] transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-xl",
        isCompleted
          ? "bg-green-500 border-green-300 hover:bg-green-600"
          : isTopic
            ? "bg-indigo-500 border-indigo-300 hover:bg-indigo-600"
            : "bg-purple-500 border-purple-300 hover:bg-purple-600",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />

      <div className="flex items-start gap-3 text-white">
        <div className="mt-0.5 shrink-0">
          {isCompleted && <CheckCircle2 size={22} />}
          {isResource && !isCompleted && getResourceIcon(data.icon)}
          {isTopic && !isCompleted && (
            <ClipboardCheck size={22} className="text-white/90" />
          )}
        </div>

        <div className="min-w-0">
          <span className="block font-medium text-base leading-6">
            {data.label}
          </span>

          {isTopic && (
            <span className="mt-1 inline-flex items-center rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium text-white/90">
              {isCompleted ? "Completed" : "Assessment"}
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
    </div>
  );
};
