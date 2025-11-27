import { useState, useEffect, useCallback } from "react";
import { fetchProfile, logout, LinkedInProfile } from "@/services/api";
import { ProfileData } from "@/types/cv";

interface UseProfileReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  profile: ProfileData | null;
  linkedInProfile: LinkedInProfile | null;
  refetch: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

// Convert LinkedIn profile to ProfileData format for the CV editor
const convertToProfileData = (linkedIn: LinkedInProfile): ProfileData => {
  return {
    fullName: linkedIn.name || `${linkedIn.firstName} ${linkedIn.lastName}`,
    title: "", // User will fill this
    email: linkedIn.email || "",
    phone: "", // LinkedIn doesn't provide phone
    location: "", // User will fill this
    summary: "", // User will fill this
    skills: [],
    education: [],
    experience: [],
    projects: [],
    languages: [],
  };
};

export const useProfile = (): UseProfileReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchProfile();
      if (data) {
        setLinkedInProfile(data);
        setProfile(convertToProfileData(data));
        setIsAuthenticated(true);
      } else {
        setLinkedInProfile(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setLinkedInProfile(null);
    setProfile(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    isLoading,
    isAuthenticated,
    profile,
    linkedInProfile,
    refetch: loadProfile,
    handleLogout,
  };
};
