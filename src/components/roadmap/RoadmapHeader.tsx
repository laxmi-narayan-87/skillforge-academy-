import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Github, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoadmapHeaderProps {
  title: string;
  description: string;
  onRegenerate: () => void;
}

const RoadmapHeader = ({ title, description, onRegenerate }: RoadmapHeaderProps) => {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto py-8">
        <Link to="/roadmaps" className="inline-flex items-center text-primary mb-6 hover:text-primary/80">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Roadmaps
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-gray-600 max-w-2xl mb-6">{description}</p>
            
            <div className="flex gap-4">
              <Button variant="outline" className="gap-2" onClick={onRegenerate}>
                <RefreshCw className="h-4 w-4" />
                Regenerate Roadmap
              </Button>
              <Button variant="outline" className="gap-2" asChild>
                <a
                  href="https://github.com/laxmi-narayan-87/skillforge-academy-"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  Contribute
                </a>
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() =>
                  document
                    .getElementById("learning-resources")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                <BookOpen className="h-4 w-4" />
                Resources
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapHeader;