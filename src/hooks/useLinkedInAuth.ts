import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signInWithLinkedIn, signOut } from "@/services/api";
import { ProfileData } from "@/types/cv";
import { User, Session } from "@supabase/supabase-js";

interface UseLinkedInAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: ProfileData | null;
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useLinkedInAuth = (): UseLinkedInAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Convert Supabase user to ProfileData format
  const convertToProfileData = (user: User): ProfileData => {
    const metadata = user.user_metadata || {};
    
    return {
      fullName: metadata.full_name || metadata.name || user.email?.split('@')[0] || "",
      title: metadata.headline || "",
      email: user.email || "",
      phone: "",
      location: metadata.location || "",
      summary: "",
      skills: [],
      education: [],
      experience: [],
      projects: [],
      languages: [],
    };
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          setProfile(convertToProfileData(session.user));
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setProfile(convertToProfileData(session.user));
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = useCallback(async () => {
    try {
      await signInWithLinkedIn();
    } catch (error) {
      console.error("Login failed:", error);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut();
    setIsAuthenticated(false);
    setProfile(null);
    setUser(null);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    profile,
    user,
    login: handleLogin,
    logout: handleLogout,
  };
};
