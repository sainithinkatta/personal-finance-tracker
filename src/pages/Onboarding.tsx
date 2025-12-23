import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { validateAvatarFile } from '@/utils/avatarValidation';
import { User, Check, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Step 1: Basic Profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: ''
  });

  // Step 2: Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const {
    updateProfile,
    uploadAvatar,
    invalidateProfile,
    refetch
  } = useProfile(userId || undefined);

  // Get user ID on mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        navigate('/');
      }
    };
    getUser();
  }, [navigate]);

  // Validate Step 1
  const validateStep1 = () => {
    const newErrors = {
      firstName: '',
      lastName: ''
    };
    let isValid = true;

    // Regex pattern for valid names: letters, spaces, hyphens, apostrophes
    // Allows international characters (unicode letters)
    const namePattern = /^[\p{L}\s'-]+$/u;
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
      isValid = false;
    } else if (!namePattern.test(firstName.trim())) {
      newErrors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
      isValid = false;
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
      isValid = false;
    } else if (!namePattern.test(lastName.trim())) {
      newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };
  const handleStep1Submit = async () => {
    if (!validateStep1()) return;
    setSaving(true);
    try {
      const {
        error
      } = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim()
      });
      if (error) throw error;
      setStep(2);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file using shared utility
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      toast({
        title: 'Invalid file',
        description: validation.error,
        variant: 'destructive'
      });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };
  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      handleComplete();
      return;
    }
    setUploading(true);
    try {
      const {
        url,
        error
      } = await uploadAvatar(avatarFile);
      if (error) throw error;
      toast({
        title: 'Avatar uploaded!',
        description: 'Your profile picture has been saved.'
      });
      handleComplete();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload avatar. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };
  const handleSkipAvatar = () => {
    handleComplete();
  };
  const handleComplete = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User session not found. Please log in again.',
        variant: 'destructive'
      });
      return;
    }
    setSaving(true);
    try {
      // Step 1: Update the database directly (bypassing hook to avoid cache issues)
      const {
        error: updateError
      } = await supabase.from('profiles').update({
        onboarding_completed: true
      }).eq('id', userId);
      if (updateError) throw updateError;

      // Step 2: Verify the update was successful
      const {
        data: verifyData,
        error: verifyError
      } = await supabase.from('profiles').select('onboarding_completed').eq('id', userId).single();
      if (verifyError) throw verifyError;
      if (!verifyData || verifyData.onboarding_completed !== true) {
        throw new Error('Failed to confirm onboarding completion. Please try again.');
      }

      // Step 3: Invalidate React Query cache so all components get fresh data
      await invalidateProfile();

      // Step 4: Force refetch to update local state before navigation
      await refetch();
      toast({
        title: 'Welcome!',
        description: 'Your profile is all set up.'
      });

      // Navigate without state flag - React Query cache is now properly invalidated
      navigate('/app', {
        replace: true
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete onboarding.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return 'U';
  };
  return <div className="min-h-screen bg-gradient-to-br from-secondary to-background flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Wallet className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold text-foreground">
            FinMate
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl shadow-lg border border-border p-6 sm:p-8">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors', step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                {step > 1 ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <div className={cn('w-12 h-1 rounded-full transition-colors', step >= 2 ? 'bg-primary' : 'bg-muted')} />
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors', step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                2
              </div>
            </div>

            {/* Step 1: Basic Profile */}
            {step === 1 && <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">Let's get started</h1>
                  <p className="text-muted-foreground mt-1">Tell us a bit about yourself</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" type="text" placeholder="Enter your first name" value={firstName} onChange={e => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors(prev => ({
                    ...prev,
                    firstName: ''
                  }));
                }} className={cn('h-11', errors.firstName && 'border-destructive')} autoFocus />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" type="text" placeholder="Enter your last name" value={lastName} onChange={e => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors(prev => ({
                    ...prev,
                    lastName: ''
                  }));
                }} className={cn('h-11', errors.lastName && 'border-destructive')} />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                  </div>
                </div>

                <Button onClick={handleStep1Submit} disabled={saving || !firstName.trim() || !lastName.trim()} className="w-full h-11 bg-primary hover:bg-primary/90">
                  {saving ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </> : <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>}
                </Button>
              </div>}

            {/* Step 2: Avatar Upload */}
            {step === 2 && <div className="space-y-6">
                {/* Step indicator */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Step 2 of 2</p>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{
                  width: '100%'
                }} />
                  </div>
                </div>

                <div className="text-center pt-2">
                  <h1 className="text-2xl font-bold text-foreground">Add a profile photo</h1>
                </div>

                <div className="flex flex-col items-center gap-3 py-4">
                  {/* Avatar circle */}
                  <div className={cn("h-28 w-28 rounded-full flex items-center justify-center overflow-hidden", avatarPreview ? "border-2 border-border" : "border-2 border-dashed border-muted-foreground/40 bg-muted/30")}>
                    {avatarPreview ? <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" /> : <span className="text-3xl font-medium text-muted-foreground">
                        {getInitials()}
                      </span>}
                  </div>

                  {/* Select/Change photo link */}
                  <label className="cursor-pointer">
                    <input type="file" accept="image/jpeg,image/png" onChange={handleAvatarSelect} className="hidden" />
                    <span className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
                      {avatarPreview ? 'Change photo' : 'Select photo'}
                    </span>
                  </label>

                  {/* Helper text - only show when no photo selected */}
                  {!avatarPreview && <p className="text-xs text-muted-foreground text-center">
                      Supports JPEG, PNG. Max size 5MB.
                    </p>}
                </div>

                {/* Action buttons */}
                {avatarPreview ? <Button onClick={handleAvatarUpload} disabled={uploading || saving} className="w-full h-11">
                    {uploading || saving ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploading ? 'Uploading...' : 'Saving...'}
                      </> : 'Save & Continue'}
                  </Button> : <Button variant="outline" onClick={handleSkipAvatar} disabled={saving} className="w-full h-11">
                    {saving ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </> : 'Continue without photo'}
                  </Button>}

                {/* Back button */}
                <button onClick={() => setStep(1)} className="w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </button>
              </div>}
          </div>
        </div>
      </main>
    </div>;
};
export default Onboarding;
