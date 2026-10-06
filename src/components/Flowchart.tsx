import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import { useMemo, useState } from "react";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useToast } from "@/components/ui/use-toast";
import { RoadmapNode } from "./roadmap/RoadmapNode";
import { RoadmapEdge } from "./roadmap/RoadmapEdge";
import { SkillAssessment } from "./SkillAssessment";
import { Dialog, DialogContent } from "./ui/dialog";
import type { AssessmentQuestion, TopicQuestions } from "@/hooks/useRoadmaps";

interface Section {
  title: string;
  topics: string[];
}

interface FlowchartProps {
  sections: Section[];
  topicQuestions?: TopicQuestions;
  roadmapId?: string;
}

const nodeTypes = {
  roadmapNode: RoadmapNode,
};

const edgeTypes = {
  roadmapEdge: RoadmapEdge,
};

export const Flowchart = ({ sections, topicQuestions = {}, roadmapId }: FlowchartProps) => {
  const { progress, markTopicComplete } = useUserProgress(roadmapId);
  const { toast } = useToast();
  const [showAssessment, setShowAssessment] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("");

  const nodes = useMemo(() => {
    const nextNodes = [];
    let yOffset = 0;

    sections.forEach((section, sectionIndex) => {
      nextNodes.push({
        id: \`section-\${sectionIndex}\`,
        type: "roadmapNode",
        position: { x: 800, y: yOffset },
        data: {
          label: \`Stage \${sectionIndex + 1}: \${section.title}\`,
          type: "resource" as const,
        },
      });

      yOffset += 200;

      section.topics.forEach((topic, topicIndex) => {
        nextNodes.push({
          id: \`topic-\${sectionIndex}-\${topicIndex}\`,
          type: "roadmapNode",
          position: {
            x: 800 + (topicIndex % 2 ? 400 : -400),
            y: yOffset + topicIndex * 200,
          },
          data: {
            label: topic,
            type: "topic" as const,
            completed: progress.completedTopics.includes(topic),
          },
        });
      });

      yOffset += (section.topics.length + 1) * 200;
    });

    return nextNodes;
  }, [sections, progress.completedTopics]);

  const edges = useMemo(() => {
    const nextEdges = [];

    sections.forEach((section, sectionIndex) => {
      if (section.topics.length === 0) return;

      nextEdges.push({
        id: \`e-section-\${sectionIndex}\`,
        source: \`section-\${sectionIndex}\`,
        target: \`topic-\${sectionIndex}-0\`,
        type: "roadmapEdge",
      });

      section.topics.forEach((_, topicIndex) => {
        if (topicIndex < section.topics.length - 1) {
          nextEdges.push({
            id: \`e-topic-\${sectionIndex}-\${topicIndex}\`,
            source: \`topic-\${sectionIndex}-\${topicIndex}\`,
            target: \`topic-\${sectionIndex}-\${topicIndex + 1}\`,
            type: "roadmapEdge",
          });
        }
      });

      if (sectionIndex < sections.length - 1) {
        const nextSection = sections[sectionIndex + 1];
        if (nextSection.topics.length > 0) {
          nextEdges.push({
            id: \`e-section-connect-\${sectionIndex}\`,
            source: \`topic-\${sectionIndex}-\${section.topics.length - 1}\`,
            target: \`section-\${sectionIndex + 1}\`,
            type: "roadmapEdge",
          });
        }
      }
    });

    return nextEdges;
  }, [sections]);

  const handleNodeClick = (_event: React.MouseEvent, node: { data?: { type?: string; label?: string } }) => {
    if (node.data?.type !== "topic" || !node.data.label) return;

    const topic = node.data.label;
    if (progress.completedTopics.includes(topic)) {
      toast({
        title: "Topic already completed",
        description: "This topic is already marked complete.",
      });
      return;
    }

    setCurrentTopic(topic);

    if (topicQuestions[topic]?.length) {
      setShowAssessment(true);
    } else {
      void markTopicComplete(topic);
      toast({
        title: "Topic Completed! 🎉",
        description: \`Great job completing "\${topic}"!\`,
        duration: 3000,
      });
    }
  };

  const handleAssessmentComplete = () => {
    setShowAssessment(false);
    void markTopicComplete(currentTopic);
    toast({
      title: "Topic Completed! 🎉",
      description: \`Great job completing "\${currentTopic}"!\`,
      duration: 3000,
    });
  };

  return (
    <>
      <div className="w-full h-[85vh] overflow-hidden bg-black rounded-xl shadow-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={handleNodeClick}
          fitView
          minZoom={0.2}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
          className="w-full h-full"
        >
          <Background size={2} gap={20} />
          <Controls showInteractive={true} className="bg-white rounded-lg p-2" />
          <MiniMap
            nodeColor={(node) => {
              if (node.data?.completed) return "#22c55e";
              return node.data?.type === "topic" ? "#6366f1" : "#8b5cf6";
            }}
            style={{
              height: 250,
              width: 350,
              backgroundColor: "#f8fafc",
              borderRadius: "0.5rem",
            }}
            className="bg-white rounded-lg shadow-lg"
          />
        </ReactFlow>
      </div>

      <Dialog open={showAssessment} onOpenChange={setShowAssessment}>
        <DialogContent className="max-w-2xl">
          {currentTopic && topicQuestions[currentTopic] && (
            <SkillAssessment
              topic={currentTopic}
              questions={topicQuestions[currentTopic]}
              onComplete={handleAssessmentComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
