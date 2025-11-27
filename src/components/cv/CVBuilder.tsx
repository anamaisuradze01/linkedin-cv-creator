import { useState, useRef } from "react";
import { ProfileData } from "@/types/cv";
import { sampleProfileData } from "@/data/sampleProfile";
import { CVForm } from "./CVForm";
import { CVPreview } from "./CVPreview";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const CVBuilder = () => {
  const [profileData, setProfileData] = useState<ProfileData>(sampleProfileData);
  const cvPreviewRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!cvPreviewRef.current) return;

    setIsGenerating(true);
    
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
      setIsGenerating(false);
    }
  };

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
              <p className="text-sm text-muted-foreground">Create your professional resume</p>
            </div>
          </div>
          
          <Button 
            onClick={handleDownloadPDF} 
            disabled={isGenerating}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? "Generating..." : "Download CV (PDF)"}
          </Button>
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
              <CVPreview ref={cvPreviewRef} data={profileData} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
