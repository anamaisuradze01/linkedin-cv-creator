import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProfileData } from "@/types/cv";
import { sampleProfileData } from "@/data/sampleProfile";
import { CVForm } from "@/components/cv/CVForm";
import { CVPreview } from "@/components/cv/CVPreview";
import { Button } from "@/components/ui/button";
import { Download, FileText, Sparkles, LogOut, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { generateCV, downloadCV } from "@/services/api";

const CVEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const useSample = searchParams.get("sample") === "true";
  
  const { isLoading: authLoading, isAuthenticated, profile, handleLogout } = useProfile();
  const [profileData, setProfileData] = useState<ProfileData>(sampleProfileData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const cvPreviewRef = useRef<HTMLDivElement>(null);

  // Load profile data when authenticated
  useEffect(() => {
    if (profile && isAuthenticated && !useSample) {
      setProfileData(prev => ({
        ...prev,
        fullName: profile.fullName || prev.fullName,
        email: profile.email || prev.email,
        // Keep sample data for other fields that LinkedIn doesn't provide
      }));
    }
  }, [profile, isAuthenticated, useSample]);

  // Redirect to login if not authenticated and not using sample
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !useSample) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, useSample, navigate]);

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

  const handleBack = async () => {
    if (isAuthenticated) {
      await handleLogout();
    }
    navigate("/");
  };

  if (authLoading && !useSample) {
    return (
      <div className="min-h-screen bg-form-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                {isAuthenticated ? "LinkedIn data loaded" : "Using sample data"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Generate CV Button - calls backend */}
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
                {isGenerating ? "Generating..." : "Generate with AI"}
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

            {/* Logout Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBack}
              title="Logout"
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
              <CVForm data={profileData} onChange={setProfileData} />
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
