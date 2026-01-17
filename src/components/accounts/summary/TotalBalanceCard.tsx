import React from 'react';
import { Landmark } from 'lucide-react';
import { calculateDebitTotals, formatBalance, getCurrencyFlag } from '../utils/accountsUtils';
import { BankAccount } from '@/types/bankAccount';

interface TotalBalanceCardProps {
  accounts: BankAccount[];
  isHidden: boolean;
}

export const TotalBalanceCard: React.FC<TotalBalanceCardProps> = ({
  accounts,
  isHidden,
}) => {
  const { usd, inr, usdCount, inrCount } = calculateDebitTotals(accounts);

  const balances = [
    { currency: 'USD', amount: usd, count: usdCount, flag: '🇺🇸' },
    { currency: 'INR', amount: inr, count: inrCount, flag: '🇮🇳' },
  ].filter(b => b.count > 0);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Icon Container */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Landmark style={{ width: '20px', height: '20px', color: '#10B981' }} />
          </div>
          {/* Title */}
          <span
            style={{
              fontWeight: 500,
              color: '#374151',
              fontSize: '15px',
            }}
          >
            Total Balance
          </span>
        </div>
        {/* Badge */}
        <span
          style={{
            background: '#EFF6FF',
            color: '#2563EB',
            fontSize: '12px',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '20px',
          }}
        >
          DEBIT
        </span>
      </div>

      {/* Amounts Container */}
      <div style={{ display: 'flex', gap: '32px', marginTop: '16px' }}>
        {balances.map((balance) => (
          <div key={balance.currency}>
            {/* Amount */}
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#111827',
              }}
            >
              {formatBalance(balance.amount, balance.currency, isHidden)}
            </div>
            {/* Account Label */}
            <div
              style={{
                fontSize: '13px',
                color: '#9CA3AF',
                marginTop: '4px',
              }}
            >
              {balance.flag} {balance.count} account{balance.count !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
        {balances.length === 0 && (
          <div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#111827',
              }}
            >
              {formatBalance(0, 'USD', isHidden)}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#9CA3AF',
                marginTop: '4px',
              }}
            >
              No accounts
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
