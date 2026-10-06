import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { roadmapCategories } from "@/data/roadmapCategories";

const labels: Record<string, string> = {
  frontend: "Frontend Developer",
  backend: "Backend Developer",
  fullstack: "Full Stack Developer",
  webscraping: "Web Scraping",
  devops: "DevOps",
  mobile: "Mobile Development",
};

const Roadmaps = () => (
  <div className="min-h-screen bg-background">
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">All Roadmaps</h1>
      {Object.values(roadmapCategories).map((category) => (
        <section key={category.title} className="mb-12">
          <h2 className="text-2xl font-semibold">{category.title}</h2>
          <p className="text-gray-600 mt-2 mb-6">{category.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {category.roadmaps.map((id) => (
              <Card key={id} className="p-6">
                <h3 className="text-xl font-semibold mb-3">{labels[id] || id}</h3>
                <Link to={`/roadmap/${id}`} className="inline-flex items-center text-primary hover:text-primary/80">
                  View Roadmap <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </main>
  </div>
);

export default Roadmaps;