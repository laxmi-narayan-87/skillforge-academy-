import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getAuthErrorMessage } from "@/utils/authErrors";
import type { AuthError, User } from "@supabase/supabase-js";
import type { AuthFormValues } from "@/schemas/authSchema";

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) {
        setUser(data.user);
        setIsAuthLoading(false);
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setIsAuthLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthError = (authError: AuthError) => {
    setIsLoading(false);
    const message = getAuthErrorMessage(authError);
    setError(message);

    if (message.includes("already registered")) {
      setActiveTab("login");
    }
  };

  const handleSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      if (activeTab === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          handleAuthError(error);
          return;
        }

        if (data.user) {
          setUser(data.user);
          navigate("/");
        }
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        handleAuthError(error);
        return;
      }

      if (data.session && data.user) {
        setUser(data.user);
        navigate("/");
      } else {
        setError("Please check your email to verify your account.");
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return {
    user,
    isAuthLoading,
    error,
    isLoading,
    activeTab,
    setActiveTab,
    handleSubmit,
    signOut,
  };
};
