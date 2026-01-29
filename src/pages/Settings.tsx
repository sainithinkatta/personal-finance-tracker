import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet, Settings as SettingsIcon } from 'lucide-react';
import AISettingsCard from '@/components/settings/AISettingsCard';

/**
 * Settings Page
 * 
 * User-facing settings for the application.
 * Currently includes:
 * - AI Settings: Manage Gemini API key for AI-powered features
 * 
 * Future sections can be added as the app grows.
 */
const Settings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">Settings</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-8">
        {/* AI Settings Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI Settings</h2>
            <p className="text-sm text-muted-foreground">
              Configure AI-powered features for your account.
            </p>
          </div>
          <AISettingsCard />
        </section>

        {/* Placeholder for future settings */}
        <section className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <SettingsIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">More Settings Coming Soon</h3>
            <p className="text-muted-foreground text-sm">
              We're working on adding more customization options like notifications, 
              data export, and display preferences.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;
