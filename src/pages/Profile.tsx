import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
}

const emptyProfile: ProfileData = {
  firstName: "",
  lastName: "",
  phone: "",
  bio: "",
  location: "",
  website: "",
  github: "",
  linkedin: "",
};

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [basicInfo, setBasicInfo] = useState<ProfileData>(emptyProfile);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      const metadata = user.user_metadata ?? {};
      setEmail(user.email ?? "");
      setBasicInfo({
        firstName: metadata.firstName ?? "",
        lastName: metadata.lastName ?? "",
        phone: metadata.phone ?? user.phone ?? "",
        bio: metadata.bio ?? "",
        location: metadata.location ?? "",
        website: metadata.website ?? "",
        github: metadata.github ?? "",
        linkedin: metadata.linkedin ?? "",
      });
      setAuthLoading(false);
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    navigate("/", { replace: true });
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: basicInfo,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Profile updated successfully.",
      });
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex justify-end mb-6">
        <Button onClick={handleSignOut} variant="outline" className="bg-red-500 text-white hover:bg-red-600 border-none">
          Sign Out
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Basic Information</CardTitle>
          <CardDescription>Update your personal information and online presence</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ["firstName", "First Name", "text", "John"],
                ["lastName", "Last Name", "text", "Doe"],
                ["phone", "Phone", "tel", "+1 (555) 000-0000"],
                ["location", "Location", "text", "City, Country"],
                ["website", "Website", "url", "https://yourwebsite.com"],
              ].map(([name, label, type, placeholder]) => (
                <div className="space-y-2" key={name}>
                  <Label htmlFor={name}>{label}</Label>
                  <Input
                    id={name}
                    name={name}
                    type={type}
                    value={basicInfo[name as keyof ProfileData]}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={basicInfo.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                className="h-32"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ["github", "GitHub", "https://github.com/username"],
                  ["linkedin", "LinkedIn", "https://linkedin.com/in/username"],
                ].map(([name, label, placeholder]) => (
                  <div className="space-y-2" key={name}>
                    <Label htmlFor={name}>{label}</Label>
                    <Input
                      id={name}
                      name={name}
                      value={basicInfo[name as keyof ProfileData]}
                      onChange={handleInputChange}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
