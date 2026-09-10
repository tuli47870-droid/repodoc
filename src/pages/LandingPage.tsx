import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Upload, Link as LinkIcon, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onRepositoryConnected: () => void;
}

export function LandingPage({ onRepositoryConnected }: LandingPageProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartDiagnosis = async () => {
    if (!repoUrl.trim()) return;
    
    setIsLoading(true);
    
    // Simulate repository connection
    setTimeout(() => {
      onRepositoryConnected();
      navigate('/scan');
    }, 1000);
  };

  const handleTryExample = () => {
    setRepoUrl('https://github.com/user/we0');
    setTimeout(() => {
      onRepositoryConnected();
      navigate('/scan');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-8 h-8 text-primary-foreground"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 12h6M12 9v6" />
              <path d="M7 3l-4 4 4 4M17 3l4 4-4 4" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Diagnose your repository
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Find bugs, security risks, architecture problems, build failures, and their root causes.
          </p>
        </div>

        {/* Main Input */}
        <div className="mb-8">
          <div className="relative mb-4">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartDiagnosis()}
              placeholder="Paste GitHub repository URL"
              className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-lg text-base focus:outline-none focus:border-primary focus:bg-background transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartDiagnosis}
              disabled={!repoUrl.trim() || isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Start Diagnosis
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <button className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              Upload ZIP
            </button>
            <button className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Github className="w-5 h-5" />
              Connect GitHub
            </button>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Public repositories can be analyzed instantly.
          </p>
        </div>

        {/* Example */}
        <div className="text-center">
          <button
            onClick={handleTryExample}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Try an example repository
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { label: 'Security Scan', icon: '🔒' },
            { label: 'Architecture Analysis', icon: '🏗️' },
            { label: 'Build Verification', icon: '⚙️' },
            { label: 'AI Diagnosis', icon: '🤖' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="p-4 border rounded-lg text-center hover:border-primary/50 transition-colors"
            >
              <div className="text-2xl mb-2">{feature.icon}</div>
              <p className="text-sm text-muted-foreground">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
