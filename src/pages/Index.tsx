import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Linkedin, FileText, Sparkles, Download, ArrowRight } from "lucide-react";
import { loginWithLinkedIn } from "@/services/api";
import { useProfile } from "@/hooks/useProfile";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useProfile();
  const hasRedirected = useRef(false); // Prevent multiple redirects

  // Redirect to CV editor if already authenticated
  useEffect(() => {
    // Prevent multiple redirects and ensure we only redirect once
    if (!hasRedirected.current && !isLoading && isAuthenticated) {
      hasRedirected.current = true;
      console.log("Redirecting to /cv-editor (authenticated)");
      navigate("/cv-editor", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLinkedInLogin = () => {
    loginWithLinkedIn();
  };

  const handleTrySampleData = () => {
    console.log("Redirecting to /cv-editor (sample data)");
    navigate("/cv-editor?sample=true", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-form-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-form-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="font-serif text-2xl">CV Builder</CardTitle>
          <CardDescription className="text-base">
            Create a professional CV powered by AI. Connect your LinkedIn profile to get started instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleLinkedInLogin}
            className="w-full gap-2 bg-[#0A66C2] hover:bg-[#004182]"
            size="lg"
          >
            <Linkedin className="w-5 h-5" />
            Login with LinkedIn
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleTrySampleData}
            className="w-full gap-2"
            size="lg"
          >
            <Sparkles className="w-4 h-4" />
            Try with Sample Data
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>

          <div className="pt-4 space-y-3">
            <h4 className="text-sm font-medium text-center text-muted-foreground">Features</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                <span>Import from LinkedIn</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI-powered CV generation</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Download className="w-4 h-4 text-green-500" />
                <span>Download as PDF</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
