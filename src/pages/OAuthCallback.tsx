import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError(errorParam);
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      // The FastAPI backend handles the OAuth callback at /oauth/callback
      // This page is just for showing loading state while the backend processes
      // After successful auth, redirect to home
      navigate("/");
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-form-bg">
        <div className="text-center">
          <p className="text-destructive mb-2">Authentication Error</p>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-form-bg">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Completing LinkedIn authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
