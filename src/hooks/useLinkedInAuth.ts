import { useState, useEffect, useCallback } from "react";
import { getSessionProfile, loginWithLinkedIn, logout, LinkedInProfile } from "@/services/api";
import { ProfileData } from "@/types/cv";

interface UseLinkedInAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: ProfileData | null;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Convert LinkedIn profile to our ProfileData format
const convertToProfileData = (linkedInProfile: LinkedInProfile): ProfileData => {
  return {
    fullName: linkedInProfile.fullName || "",
    title: linkedInProfile.title || "",
    email: linkedInProfile.email || "",
    phone: "", // LinkedIn doesn't provide phone
    location: linkedInProfile.location || "",
    summary: linkedInProfile.summary || "",
    skills: linkedInProfile.skills || [],
    education: linkedInProfile.education || [],
    experience: linkedInProfile.experience || [],
    projects: [],
    languages: [],
  };
};

export const useLinkedInAuth = (): UseLinkedInAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const linkedInProfile = await getSessionProfile();
      if (linkedInProfile) {
        setIsAuthenticated(true);
        setProfile(convertToProfileData(linkedInProfile));
      } else {
        setIsAuthenticated(false);
        setProfile(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setIsAuthenticated(false);
    setProfile(null);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    isLoading,
    profile,
    login: loginWithLinkedIn,
    logout: handleLogout,
    checkAuth,
  };
};
