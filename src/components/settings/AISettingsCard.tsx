import React, { useState } from 'react';
import { Bot, Check, ExternalLink, Eye, EyeOff, Loader2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAISettings } from '@/hooks/useAISettings';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * AI Settings Card Component
 * 
 * Allows users to manage their Gemini API key for AI-powered features.
 * 
 * States:
 * - Loading: Shows skeleton while checking key status
 * - Not Connected: Shows input to add a key
 * - Connected: Shows masked key with update/remove actions
 * 
 * SECURITY: The actual key is never displayed after saving.
 * Only a masked placeholder is shown.
 */
const AISettingsCard: React.FC = () => {
  const { hasKey, isLoading, isSaving, isRemoving, saveKey, removeKey } = useAISettings();
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    setError(null);

    // Client-side validation
    if (!keyInput.trim()) {
      setError('Please enter your API key');
      return;
    }

    if (keyInput.length < 10) {
      setError('API key seems too short. Please check and try again.');
      return;
    }

    if (keyInput.length > 200) {
      setError('API key is too long. Please check and try again.');
      return;
    }

    const result = await saveKey(keyInput);
    
    if (result.success) {
      setKeyInput('');
      setIsEditing(false);
      setShowKey(false);
    } else {
      setError(result.error || 'Failed to save API key');
    }
  };

  const handleRemove = async () => {
    const result = await removeKey();
    if (!result.success) {
      setError(result.error || 'Failed to remove API key');
    }
  };

  const handleCancel = () => {
    setKeyInput('');
    setIsEditing(false);
    setShowKey(false);
    setError(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Gemini API Key</CardTitle>
          </div>
          <CardDescription>
            Connect your Gemini API key to enable AI-powered features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Connected state (user has a key saved)
  if (hasKey && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Gemini API Key</CardTitle>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
          <CardDescription>
            Your Gemini API key is securely stored and ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Masked key display */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
            <span className="text-sm font-mono text-muted-foreground flex-1">
              ••••••••••••••••••••••••
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isRemoving}
            >
              Update Key
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={isRemoving}
                >
                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove API Key?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove your Gemini API key. AI-powered features like 
                    bank statement import will stop working until you add a new key.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemove}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Remove Key
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  // Not connected state / Editing state
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Gemini API Key</CardTitle>
          </div>
          {!hasKey && (
            <Badge variant="outline" className="text-muted-foreground">
              Not Connected
            </Badge>
          )}
        </div>
        <CardDescription>
          {hasKey 
            ? "Update your Gemini API key."
            : "Connect your Gemini API key to enable AI-powered features like bank statement import."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key input */}
        <div className="space-y-2">
          <Label htmlFor="gemini-key">API Key</Label>
          <div className="relative">
            <Input
              id="gemini-key"
              type={showKey ? 'text' : 'password'}
              placeholder="Enter your Gemini API key"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setError(null);
              }}
              className="pr-10"
              disabled={isSaving}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowKey(!showKey)}
              disabled={isSaving}
            >
              {showKey ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Help text */}
        <p className="text-sm text-muted-foreground">
          Get your API key from{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            Google AI Studio
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving || !keyInput.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Validating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Key
              </>
            )}
          </Button>
          
          {isEditing && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AISettingsCard;
