// API service - uses Lovable Cloud edge function by default, 
// or FastAPI backend if VITE_BACKEND_URL is explicitly set
import { supabase } from "@/integrations/supabase/client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const USE_FASTAPI = Boolean(BACKEND_URL);

export interface LinkedInProfile {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  id: string;
  picture: string;
  full_profile?: Record<string, unknown>;
}

export interface GenerateCVPayload {
  name: string;
  title: string;
  skills: string[];
  experience: string[];
  phone?: string;
  style?: string;
}

export interface GenerateCVResponse {
  success: boolean;
  summary?: string;
  download_url?: string;
  error?: string;
}

// Redirect to LinkedIn OAuth via FastAPI (only when using FastAPI backend)
export const loginWithLinkedIn = () => {
  if (USE_FASTAPI) {
    window.location.href = `${BACKEND_URL}/login`;
  } else {
    console.log("LinkedIn OAuth requires FastAPI backend. Set VITE_BACKEND_URL.");
  }
};

// Fetch LinkedIn profile from FastAPI session
export const fetchProfile = async (): Promise<LinkedInProfile | null> => {
  if (!USE_FASTAPI) return null;
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/profile`, {
      method: "GET",
      credentials: "include",
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

// Generate CV using Lovable Cloud edge function or FastAPI
export const generateCV = async (payload: GenerateCVPayload): Promise<GenerateCVResponse> => {
  // Use Lovable Cloud edge function
  if (!USE_FASTAPI) {
    try {
      console.log("Calling Lovable Cloud generate-cv function...");
      
      const { data, error } = await supabase.functions.invoke('generate-cv', {
        body: payload,
      });

      if (error) {
        console.error("Edge function error:", error);
        return {
          success: false,
          error: error.message || "Failed to generate CV",
        };
      }

      return data as GenerateCVResponse;
    } catch (error) {
      console.error("Error generating CV:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Use FastAPI backend
  try {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("skills", payload.skills.join(", "));
    formData.append("experience", payload.experience.join("; "));
    formData.append("phone", payload.phone || "");

    const response = await fetch(`${BACKEND_URL}/generate_cv`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || errorData.detail || "Failed to generate CV",
      };
    }

    return {
      success: true,
      download_url: `${BACKEND_URL}/download_cv`,
    };
  } catch (error) {
    console.error("Error generating CV:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

// Download CV PDF from FastAPI
export const downloadCV = async (path?: string): Promise<boolean> => {
  if (!USE_FASTAPI) return false;
  
  try {
    const url = path || `${BACKEND_URL}/download_cv`;
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) return false;

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "cv.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    return true;
  } catch (error) {
    console.error("Error downloading CV:", error);
    return false;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  if (USE_FASTAPI) {
    try {
      await fetch(`${BACKEND_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }
};

export { BACKEND_URL, USE_FASTAPI };
