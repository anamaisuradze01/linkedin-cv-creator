// API service for FastAPI backend integration
// Configure this to point to your FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface LinkedInProfile {
  fullName: string;
  title: string;
  email: string;
  location: string;
  summary: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    years: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    years: string;
  }>;
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
  preview_html?: string;
  error?: string;
}

// Redirect to LinkedIn OAuth login
export const loginWithLinkedIn = () => {
  window.location.href = `${API_BASE_URL}/login`;
};

// Check if user is authenticated and get profile data
export const getSessionProfile = async (): Promise<LinkedInProfile | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "GET",
      credentials: "include", // Important for session cookies
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

// Generate CV using the backend AI
export const generateCV = async (payload: GenerateCVPayload): Promise<GenerateCVResponse> => {
  try {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("skills", payload.skills);
    formData.append("experience", payload.experience);
    formData.append("phone", payload.phone);

    const response = await fetch(`${API_BASE_URL}/generate_cv`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || "Failed to generate CV",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating CV:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};

// Download the generated CV PDF
export const downloadCV = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/download_cv`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

    // Create blob and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cv.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Error downloading CV:", error);
    return false;
  }
};

// Logout and clear session
export const logout = async (): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

export { API_BASE_URL };
