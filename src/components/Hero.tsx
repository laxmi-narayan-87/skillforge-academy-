import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="relative bg-gradient-to-r from-primary to-secondary">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container mx-auto relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between py-4 text-white">
          <div className="flex items-center space-x-8">
            <Link to="/about" className="text-xl font-bold hover:text-white/80 transition-colors">
              SkillForge Academy
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/roadmaps" className="hover:text-white/80">
                Roadmaps
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link to="/profile">
                <Button className="bg-[#F97316] hover:bg-[#f97316]/90 text-white">
                  Profile
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white border-none">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="py-20 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Developer Roadmaps and Learning Paths
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Community-driven roadmaps, learning paths, and resources for self-guided developers. 
              Choose your path and start your development journey.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/roadmaps">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white border-none">
                  View All Roadmaps
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Featured Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
              alt="Developer working"
              className="rounded-lg shadow-lg w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
            />
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f"
              alt="Learning environment"
              className="rounded-lg shadow-lg w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
            />
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
              alt="Mobile development"
              className="rounded-lg shadow-lg w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
