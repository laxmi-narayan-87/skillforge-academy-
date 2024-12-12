import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import { useCallback } from "react";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useToast } from "@/components/ui/use-toast";
import { RoadmapNode } from "./roadmap/RoadmapNode";
import { RoadmapEdge } from "./roadmap/RoadmapEdge";
import { RoadmapTooltip } from "./roadmap/RoadmapTooltip";

interface Section {
  title: string;
  topics: string[];
}

interface FlowchartProps {
  sections: Section[];
}

const nodeTypes = {
  roadmapNode: RoadmapNode,
};

const edgeTypes = {
  roadmapEdge: RoadmapEdge,
};

export const Flowchart = ({ sections }: FlowchartProps) => {
  const { progress, markTopicComplete } = useUserProgress();
  const { toast } = useToast();

  const createNodes = useCallback(() => {
    const nodes = [];
    let yOffset = 0;

    sections.forEach((section, sectionIndex) => {
      // Add section header node
      nodes.push({
        id: `section-${sectionIndex}`,
        type: 'roadmapNode',
        position: { x: 800, y: yOffset }, // Increased x position for more space
        data: { 
          label: `Stage ${sectionIndex + 1}: ${section.title}`,
          type: 'resource'
        }
      });

      yOffset += 200; // Increased vertical spacing

      // Add topic nodes
      section.topics.forEach((topic, topicIndex) => {
        const isCompleted = progress.completedTopics.includes(topic);
        nodes.push({
          id: `topic-${sectionIndex}-${topicIndex}`,
          type: 'roadmapNode',
          position: { 
            x: 800 + (topicIndex % 2 ? 400 : -400), // Increased horizontal spacing
            y: yOffset + topicIndex * 200 // Increased vertical spacing
          },
          data: {
            label: topic,
            type: 'topic',
            completed: isCompleted
          }
        });
      });

      yOffset += (section.topics.length + 1) * 200; // Increased section spacing
    });

    return nodes;
  }, [sections, progress.completedTopics]);

  const createEdges = useCallback(() => {
    const edges = [];
    
    sections.forEach((section, sectionIndex) => {
      // Connect section to its first topic
      edges.push({
        id: `e-section-${sectionIndex}`,
        source: `section-${sectionIndex}`,
        target: `topic-${sectionIndex}-0`,
        type: 'roadmapEdge'
      });

      // Connect topics within section
      section.topics.forEach((_, topicIndex) => {
        if (topicIndex < section.topics.length - 1) {
          edges.push({
            id: `e-topic-${sectionIndex}-${topicIndex}`,
            source: `topic-${sectionIndex}-${topicIndex}`,
            target: `topic-${sectionIndex}-${topicIndex + 1}`,
            type: 'roadmapEdge'
          });
        }
      });

      // Connect last topic to next section
      if (sectionIndex < sections.length - 1) {
        edges.push({
          id: `e-section-connect-${sectionIndex}`,
          source: `topic-${sectionIndex}-${section.topics.length - 1}`,
          target: `section-${sectionIndex + 1}`,
          type: 'roadmapEdge'
        });
      }
    });

    return edges;
  }, [sections]);

  const handleNodeClick = (event: React.MouseEvent, node: any) => {
    if (node.data.type === 'topic') {
      markTopicComplete(node.data.label);
      toast({
        title: "Topic Completed! 🎉",
        description: `Great job completing "${node.data.label}"!`,
        duration: 3000
      });
    }
  };

  return (
    <div className="w-full h-[1000px] overflow-hidden bg-white rounded-xl shadow-lg"> {/* Increased height */}
      <ReactFlow
        nodes={createNodes()}
        edges={createEdges()}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView
        minZoom={0.2} // Decreased min zoom to show more content
        maxZoom={2} // Increased max zoom for better detail view
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }} // Adjusted initial zoom level
      >
        <Background size={2} gap={20} /> {/* Increased gap for better visibility */}
        <Controls 
          showInteractive={true}
          className="bg-white rounded-lg p-2" // Added styling to controls
        />
        <MiniMap 
          nodeColor={(node) => {
            if (node.data?.completed) return '#22c55e';
            return node.data?.type === 'topic' ? '#6366f1' : '#8b5cf6';
          }}
          style={{ 
            height: 150, 
            width: 250,
            backgroundColor: '#f8fafc',
            borderRadius: '0.5rem',
          }} // Increased minimap size and added styling
          className="bg-white rounded-lg shadow-lg" // Added styling to minimap
        />
      </ReactFlow>
    </div>
  );
};