import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setIsAuthenticated(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setIsAuthenticated(!!session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="relative bg-gradient-to-r from-primary to-secondary">
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d)", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="container mx-auto relative z-10">
        <nav className="flex items-center justify-between py-4 text-white">
          <Link to="/about" className="text-xl font-bold hover:text-white/80 transition-colors">SkillForge Academy</Link>
          <div className="flex items-center space-x-4">
            <Link to="/roadmaps"><Button className="bg-blue-500 hover:bg-blue-600 text-white border-none">Roadmaps</Button></Link>
            {isAuthenticated ? (
              <Link to="/dashboard"><Button className="bg-[#F97316] hover:bg-[#f97316]/90 text-white">Dashboard</Button></Link>
            ) : (
              <Link to="/login"><Button className="bg-blue-500 hover:bg-blue-600 text-white border-none">Sign In</Button></Link>
            )}
          </div>
        </nav>
        <div className="py-20 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Developer Roadmaps and Learning Paths</h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">Personalized developer roadmaps, interactive assessments, and curated learning resources for self-guided learning.</p>
            <div className="flex justify-center space-x-4"><Link to="/roadmaps"><Button className="bg-blue-500 hover:bg-blue-600 text-white border-none">View All Roadmaps</Button></Link></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;