import { useState, useRef, useEffect } from "react";
import { ProfileData } from "@/types/cv";
import { sampleProfileData } from "@/data/sampleProfile";
import { CVForm } from "./CVForm";
import { CVPreview } from "./CVPreview";
import { LinkedInLoginCard } from "./LinkedInLoginCard";
import { Button } from "@/components/ui/button";
import { Download, FileText, Sparkles, LogOut, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLinkedInAuth } from "@/hooks/useLinkedInAuth";
import { generateCV, downloadCV, GenerateCVPayload } from "@/services/api";

export const CVBuilder = () => {
  const { isAuthenticated, isLoading: authLoading, profile, login, logout } = useLinkedInAuth();
  const [profileData, setProfileData] = useState<ProfileData>(sampleProfileData);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasGeneratedCV, setHasGeneratedCV] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const cvPreviewRef = useRef<HTMLDivElement>(null);

  // Update profile data when LinkedIn profile is loaded
  useEffect(() => {
    if (profile && isAuthenticated) {
      setProfileData(profile);
      setUsingSampleData(false);
    }
  }, [profile, isAuthenticated]);

  const handleUseSampleData = () => {
    setProfileData(sampleProfileData);
    setUsingSampleData(true);
  };

  const handleGenerateCV = async () => {
    setIsGenerating(true);
    
    try {
      const payload: GenerateCVPayload = {
        title: profileData.title,
        skills: profileData.skills.join(", "),
        experience: profileData.experience.map(exp => 
          `${exp.title} at ${exp.company} (${exp.years}): ${exp.description}`
        ).join("\n"),
        phone: profileData.phone,
      };

      const result = await generateCV(payload);
      
      if (result.success) {
        setHasGeneratedCV(true);
        if (result.preview_html) {
          setAiSummary(result.preview_html);
        }
        toast({
          title: "CV Generated!",
          description: "Your AI-enhanced CV is ready. You can now download it.",
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
      const success = await downloadCV();
      
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

  const handleLogout = async () => {
    await logout();
    setProfileData(sampleProfileData);
    setUsingSampleData(false);
    setHasGeneratedCV(false);
    setAiSummary(null);
  };

  // Show login card if not authenticated and not using sample data
  if (!isAuthenticated && !usingSampleData) {
    return (
      <LinkedInLoginCard 
        onLogin={login} 
        onUseSampleData={handleUseSampleData}
        isLoading={authLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-form-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1800px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          
          <div className="flex items-center gap-2">
            {/* Generate CV Button */}
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
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>

            {/* Download Button - Use backend if CV was generated, else client-side */}
            <Button 
              onClick={hasGeneratedCV ? handleDownloadFromBackend : handleDownloadPDF} 
              disabled={isDownloading}
              className="gap-2"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>

            {/* Logout Button */}
            {(isAuthenticated || usingSampleData) && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Form */}
          <aside className="w-full lg:w-[420px] lg:flex-shrink-0">
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2 custom-scrollbar">
              <CVForm data={profileData} onChange={setProfileData} />
            </div>
          </aside>

          {/* Right Column - Preview */}
          <section className="flex-1 min-w-0">
            <div className="bg-muted/50 rounded-xl p-4 md:p-8 overflow-x-auto">
              {/* AI Summary Banner */}
              {aiSummary && (
                <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">AI-Enhanced Summary</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{aiSummary}</p>
                </div>
              )}
              <CVPreview ref={cvPreviewRef} data={profileData} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
