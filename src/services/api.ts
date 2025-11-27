// API service for CV generation using Lovable Cloud
import { supabase } from "@/integrations/supabase/client";

export interface GenerateCVPayload {
  name: string;
  title: string;
  skills: string[];
  experience: string[];
  style?: string;
}

export interface GenerateCVResponse {
  success: boolean;
  summary?: string;
  name?: string;
  title?: string;
  skills?: string[];
  experience?: string[];
  error?: string;
}

// Generate CV summary using AI
export const generateCVSummary = async (payload: GenerateCVPayload): Promise<GenerateCVResponse> => {
  try {
    console.log("Calling generate-cv edge function with:", payload);
    
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
};

// LinkedIn OAuth via Supabase Auth
export const signInWithLinkedIn = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });

  if (error) {
    console.error("LinkedIn OAuth error:", error);
    throw error;
  }

  return data;
};

// Get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Session error:", error);
    return null;
  }
  return session;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error);
  }
};
