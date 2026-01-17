import React from 'react';
import { Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { calculateTotalDue, formatBalance } from '../utils/accountsUtils';
import { BankAccount } from '@/types/bankAccount';

interface TotalDueCardProps {
  accounts: BankAccount[];
  isHidden: boolean;
}

export const TotalDueCard: React.FC<TotalDueCardProps> = ({
  accounts,
  isHidden,
}) => {
  const { totalDue, nextDueDate } = calculateTotalDue(accounts);

  // Check if due date is within 7 days for urgency indicator
  const isUrgent = nextDueDate && differenceInDays(nextDueDate, new Date()) <= 7;

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        minHeight: 'auto',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Icon Container */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Calendar style={{ width: '20px', height: '20px', color: '#EF4444' }} />
        </div>
        {/* Title */}
        <span
          style={{
            fontWeight: 500,
            color: '#374151',
            fontSize: '15px',
          }}
        >
          Total Due This Month
        </span>
      </div>

      {/* Amount */}
      <div
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#EF4444',
          marginTop: '16px',
        }}
      >
        {formatBalance(totalDue, 'USD', isHidden)}
      </div>

      {/* Due Date */}
      <div
        style={{
          fontSize: '13px',
          color: '#6B7280',
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {nextDueDate ? (
          <>
            Next due: {format(nextDueDate, 'MMM d, yyyy')}
            {isUrgent && !isHidden && (
              <span
                style={{
                  background: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                Due soon
              </span>
            )}
          </>
        ) : totalDue === 0 ? (
          'No payments due'
        ) : (
          'No due date set'
        )}
      </div>
    </div>
  );
};
