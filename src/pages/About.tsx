import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary to-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 text-center">
            About SkillForge Academy
          </h1>
          
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Our Mission</CardTitle>
                <CardDescription>Empowering developers through structured learning paths</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  SkillForge Academy is dedicated to providing comprehensive, community-driven roadmaps 
                  and learning resources for developers at all stages of their journey. We believe in 
                  making quality education accessible and structured.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What We Offer</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Customized learning paths for different technology stacks</li>
                  <li>Interactive roadmaps with progress tracking</li>
                  <li>Expert-curated learning materials</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Choose SkillForge?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                  <div>
                    <h4 className="font-semibold mb-2">Structured Learning</h4>
                    <p>Follow clear, step-by-step paths to master new technologies</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Track Progress</h4>
                    <p>Monitor your learning journey with built-in progress tracking</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;