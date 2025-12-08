import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface CapsLockWarningProps {
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const CapsLockWarning: React.FC<CapsLockWarningProps> = ({ inputRef }) => {
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  useEffect(() => {
    const handleKeyEvent = (e: KeyboardEvent) => {
      // Check if Caps Lock is active
      if (e.getModifierState) {
        setIsCapsLockOn(e.getModifierState('CapsLock'));
      }
    };

    // Add listeners to window
    window.addEventListener('keydown', handleKeyEvent);
    window.addEventListener('keyup', handleKeyEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyEvent);
      window.removeEventListener('keyup', handleKeyEvent);
    };
  }, []);

  if (!isCapsLockOn) return null;

  return (
    <div className="flex items-center gap-1.5 text-warning-foreground text-xs mt-1">
      <AlertTriangle className="h-3 w-3" />
      <span>Caps Lock is on</span>
    </div>
  );
};
