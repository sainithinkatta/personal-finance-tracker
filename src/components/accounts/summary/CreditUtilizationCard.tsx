import React from 'react';
import { CreditCard } from 'lucide-react';
import {
  calculateCreditUtilization,
  formatBalance,
} from '../utils/accountsUtils';
import { BankAccount } from '@/types/bankAccount';

interface CreditUtilizationCardProps {
  accounts: BankAccount[];
  isHidden: boolean;
}

// Get utilization color based on percentage
const getUtilizationColor = (percentage: number): string => {
  if (percentage < 30) return '#10B981'; // green
  if (percentage <= 70) return '#F59E0B'; // amber
  return '#EF4444'; // red
};

export const CreditUtilizationCard: React.FC<CreditUtilizationCardProps> = ({
  accounts,
  isHidden,
}) => {
  const { totalLimit, totalUsed, percentage } =
    calculateCreditUtilization(accounts);
  const utilizationColor = getUtilizationColor(percentage);

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
          <CreditCard style={{ width: '20px', height: '20px', color: '#EF4444' }} />
        </div>
        {/* Title */}
        <span
          style={{
            fontWeight: 500,
            color: '#374151',
            fontSize: '15px',
          }}
        >
          Credit Utilization
        </span>
      </div>

      {/* Percentage */}
      <div
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: utilizationColor,
          marginTop: '16px',
        }}
      >
        {isHidden ? '••••' : `${percentage.toFixed(1)}%`}
      </div>

      {/* Progress Bar Container */}
      <div
        style={{
          height: '8px',
          background: '#E5E7EB',
          borderRadius: '4px',
          margin: '12px 0',
          overflow: 'hidden',
        }}
      >
        {/* Progress Bar Fill */}
        <div
          style={{
            width: isHidden ? '0%' : `${Math.min(percentage, 100)}%`,
            height: '100%',
            background: utilizationColor,
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Subtext */}
      <div
        style={{
          fontSize: '13px',
          color: '#6B7280',
        }}
      >
        {isHidden ? (
          '••••• of •••••'
        ) : (
          <>
            {formatBalance(totalUsed, 'USD', false)} of{' '}
            {formatBalance(totalLimit, 'USD', false)}
          </>
        )}
      </div>
    </div>
  );
};
