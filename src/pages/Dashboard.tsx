import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthLoading, signOut } = useAuth();
  const { progress } = useUserProgress();

  useEffect(() => {
    if (!isAuthLoading && !user) navigate("/login", { replace: true });
  }, [isAuthLoading, navigate, user]);

  if (isAuthLoading || !user) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>;
  }

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Learning Dashboard</h1>
        <div className="space-x-4">
          <Link to="/profile"><Button variant="outline">Profile</Button></Link>
          <Button variant="destructive" onClick={() => void handleLogout()}>Logout</Button>
        </div>
      </div>
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
        <div className="space-y-4">
          <div><p className="text-gray-600">Current Level</p><p className="text-lg font-medium capitalize">{progress.currentLevel}</p></div>
          <div><p className="text-gray-600">Completed Topics</p><p className="text-lg font-medium">{progress.completedTopics.length}</p></div>
        </div>
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Start Learning</h2>
        <p className="text-gray-600 mb-4">Open a roadmap to continue learning and track completed topics.</p>
        <Link to="/roadmaps"><Button>Browse Roadmaps</Button></Link>
      </Card>
    </div>
  );
};

export default Dashboard;