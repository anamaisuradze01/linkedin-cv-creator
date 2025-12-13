import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProfileData } from "@/types/cv";
import { sampleProfileData } from "@/data/sampleProfile";
import { CVForm } from "@/components/cv/CVForm";
import { CVPreview } from "@/components/cv/CVPreview";
import { Button } from "@/components/ui/button";
import { Download, FileText, Sparkles, LogOut, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateCV, downloadCV, fetchProfileById, LinkedInProfile } from "@/services/api";

const CVEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user_id");
  const useSample = searchParams.get("sample") === "true";
  
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>(sampleProfileData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const cvPreviewRef = useRef<HTMLDivElement>(null);

  // Fetch profile by user_id
  useEffect(() => {
    const loadProfile = async () => {
      if (userId) {
        setIsLoading(true);
        try {
          const data = await fetchProfileById(userId);
          if (data) {
            setProfile(data);
            // Update profile data with LinkedIn info
            setProfileData(prev => ({
              ...prev,
              fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || prev.fullName,
              email: data.email || prev.email,
            }));
          } else {
            toast({
              title: "Profile not found",
              description: "Could not load your LinkedIn profile. Using sample data.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error loading profile:", error);
          toast({
            title: "Error",
            description: "Failed to load profile. Using sample data.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else if (useSample) {
        setIsLoading(false);
      } else {
        // No user_id and not using sample - redirect to home
        navigate("/");
      }
    };

    loadProfile();
  }, [userId, useSample, navigate]);

  const isAuthenticated = !!profile;

  const handleGenerateCV = async () => {
    setIsGenerating(true);
    
    try {
      const result = await generateCV({
        title: profileData.title,
        skills: profileData.skills.join(", "),
        experience: profileData.experience.map(exp => 
          `${exp.title} at ${exp.company} (${exp.years}): ${exp.description}`
        ).join("; "),
        phone: profileData.phone,
      });
      
      if (result.success) {
        setDownloadUrl(result.download_url || null);
        toast({
          title: "CV Generated!",
          description: "Your CV is ready for download.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate CV. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating CV:", error);
      toast({
        title: "Error",
        description: "Failed to connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadFromBackend = async () => {
    setIsDownloading(true);
    
    try {
      const success = await downloadCV(downloadUrl || undefined);
      
      if (success) {
        toast({
          title: "CV Downloaded!",
          description: "Your CV has been saved as a PDF file.",
        });
      } else {
        toast({
          title: "Download Failed",
          description: "Failed to download CV. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast({
        title: "Error",
        description: "Failed to download CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Client-side PDF download as fallback
  const handleDownloadPDF = async () => {
    if (!cvPreviewRef.current) return;

    setIsDownloading(true);
    
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      
      const element = cvPreviewRef.current;
      const opt = {
        margin: 0,
        filename: `${profileData.fullName.replace(/\s+/g, "_")}_CV.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: { 
          unit: "mm" as const, 
          format: "a4" as const, 
          orientation: "portrait" as const 
        },
      };

      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "CV Downloaded!",
        description: "Your CV has been saved as a PDF file.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-form-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-form-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1800px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold text-foreground">CV Builder</h1>
              <p className="text-sm text-muted-foreground">
                {isAuthenticated ? `Welcome, ${profile?.firstName || 'User'}` : "Using sample data"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tailor to Title Button - calls backend */}
            <Button 
              onClick={handleGenerateCV} 
              disabled={isGenerating}
              variant="outline"
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isGenerating ? "Tailoring..." : "Tailor to Title"}
              </span>
            </Button>

            {/* Download Button - from backend if generated, else client-side */}
            <Button 
              onClick={downloadUrl ? handleDownloadFromBackend : handleDownloadPDF} 
              disabled={isDownloading}
              className="gap-2"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isDownloading ? "Downloading..." : "Download PDF"}
              </span>
            </Button>

            {/* Back Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBack}
              title="Back to Home"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive Two Column Layout */}
      <main className="max-w-[1800px] mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Form (scrollable on desktop) */}
          <aside className="w-full lg:w-[420px] lg:flex-shrink-0">
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2 custom-scrollbar">
              <CVForm 
                data={profileData} 
                onChange={setProfileData}
                userId={userId || undefined}
                onClearAll={() => {
                  setProfileData({
                    fullName: "",
                    title: "",
                    email: "",
                    phone: "",
                    location: "",
                    summary: "",
                    skills: [],
                    education: [{ school: "", degree: "", years: "" }],
                    experience: [{ title: "", company: "", years: "", description: "" }],
                    projects: [],
                    languages: []
                  });
                  toast({
                    title: "Cleared",
                    description: "All fields have been cleared.",
                  });
                }}
              />
            </div>
          </aside>

          {/* Right Column - Live Preview */}
          <section className="flex-1 min-w-0">
            <div className="bg-muted/50 rounded-xl p-4 md:p-8 overflow-x-auto">
              {/* Status Banner */}
              {downloadUrl && (
                <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">CV Ready for Download</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Your AI-generated CV has been created. Click "Download PDF" to save it.</p>
                </div>
              )}
              
              {/* Live CV Preview */}
              <CVPreview ref={cvPreviewRef} data={profileData} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CVEditor;
