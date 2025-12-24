// API service for FastAPI backend integration
// Configure your FastAPI backend URL in .env as VITE_BACKEND_URL
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

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
  title: string;
  skills: string;
  experience: string;
  phone: string;
}

export interface GenerateCVResponse {
  success: boolean;
  download_url?: string;
  error?: string;
}

// Redirect to LinkedIn OAuth via FastAPI
export const loginWithLinkedIn = () => {
  window.location.href = `${BACKEND_URL}/login`;
};

// Fetch LinkedIn profile by user_id
export const fetchProfileById = async (
  userId: string
): Promise<LinkedInProfile | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `${BACKEND_URL}/api/profile?user_id=${encodeURIComponent(userId)}`,
      {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log("No profile found for user_id:", userId);
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Profile fetch timed out - backend may be starting up");
    } else {
      console.error("Error fetching profile:", error);
    }
    return null;
  }
};

// Legacy: Fetch LinkedIn profile from FastAPI session (without user_id)
export const fetchProfile = async (): Promise<LinkedInProfile | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${BACKEND_URL}/api/profile`, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log("No profile found or not authenticated");
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Profile fetch timed out - backend may be starting up");
    } else {
      console.error("Error fetching profile:", error);
    }
    return null;
  }
};

// Generate CV using FastAPI backend
export const generateCV = async (
  payload: GenerateCVPayload
): Promise<GenerateCVResponse> => {
  try {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("skills", payload.skills);
    formData.append("experience", payload.experience);
    formData.append("phone", payload.phone);

    const response = await fetch(`${BACKEND_URL}/generate_cv`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error:
          errorData.error ||
          errorData.detail ||
          "Failed to generate CV",
      };
    }

    const data = await response.json().catch(() => null);

    if (data && data.link) {
      return {
        success: true,
        download_url: `${BACKEND_URL}${data.link}`,
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

// ===== Tailoring =====

import type { ProfileData } from "@/types/cv";

export interface TailorCVRequest {
  user_id: string;
  job_title: string;
  current_data: ProfileData;
}

export interface TailorCVResponse {
  success: boolean;
  tailored_data?: ProfileData;
  error?: string;
}

// Tailor CV to specific job title
export const tailorCVToTitle = async (
  payload: TailorCVRequest
): Promise<TailorCVResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/tailor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error:
          errorData.error ||
          errorData.detail ||
          "Failed to tailor CV",
      };
    }

    const data = await response.json();
    return {
      success: true,
      tailored_data: data.tailored_data,
    };
  } catch (error) {
    console.error("Error tailoring CV:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

// Download the generated CV PDF
export const downloadCV = async (path?: string): Promise<boolean> => {
  try {
    const url = path || `${BACKEND_URL}/download_cv`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

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

// Logout from FastAPI session
export const logout = async (): Promise<void> => {
  try {
    await fetch(`${BACKEND_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

export { BACKEND_URL };
