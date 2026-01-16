import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountsHeaderProps {
  onAddAccount: () => void;
}

export const AccountsHeader: React.FC<AccountsHeaderProps> = ({
  onAddAccount,
}) => {
  return (
    <div className="flex justify-end mb-6">
      {/* Add Account Button */}
      <Button
        onClick={onAddAccount}
        className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
      >
        <Plus className="h-4 w-4" />
        <span>Add Account</span>
      </Button>
    </div>
  );
};
