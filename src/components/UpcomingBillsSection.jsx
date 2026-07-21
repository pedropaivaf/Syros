/**
 * UpcomingBillsSection Component
 *
 * Exibe próximos lançamentos e lembretes de vencimento
 * Feature Premium
 */

import React, { useMemo } from 'react';
import PremiumBadge from './PremiumBadge';
import PremiumCard from './PremiumCard';
import { hasFeature } from '../config';
import { getUpcomingBills } from '../utils/calculations';

export default function UpcomingBillsSection({ transactions }) {
  const isPremium = hasFeature('recurring_bills');

  const upcomingBills = useMemo(() => {
    if (!isPremium) return [];
    return getUpcomingBills(transactions, 30);
  }, [transactions, isPremium]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays > 1 && diffDays <= 7) return `Em ${diffDays} dias`;

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getDaysUntil = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (days) => {
    if (days <= 3) return 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-[#9B2226] dark:text-[#E76F51]';
    if (days <= 7) return 'bg-amber-100 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200';
    return 'bg-[#E8F0F4] dark:bg-[#1B2B35] border-[#1B4965]/20 dark:border-[#5FA8D3]/20 text-[#1B4965] dark:text-[#5FA8D3]';
  };

  if (!isPremium) {
    return (
      <PremiumCard
        title="Próximos Lançamentos"
        description="Veja todos os seus lançamentos futuros e receba lembretes de vencimento. Nunca mais atrase um pagamento!"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold font-display text-[#1A1A1A] dark:text-[#E8E4DF]">
          Próximos Lançamentos
        </h2>
        <PremiumBadge size="xs" />
      </div>

      {upcomingBills.length === 0 ? (
        <p className="text-center text-[#6B6B6B] dark:text-[#A09A92] py-8 text-sm">
          Nenhum lançamento futuro nos próximos 30 dias.
        </p>
      ) : (
        <div className="space-y-3">
          {upcomingBills.map((bill) => {
            const daysUntil = getDaysUntil(bill.createdAt);

            return (
              <div
                key={bill.id}
                className={`p-4 rounded-xl border-2 ${getUrgencyColor(daysUntil)} transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">
                        {bill.description}
                      </h3>
                    </div>
                    <p className="text-xs opacity-75">
                      Vence: {formatDate(bill.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      R$ {Math.abs(bill.amount).toFixed(2)}
                    </p>
                    {daysUntil <= 3 && (
                      <p className="text-xs font-medium">
                        Urgente!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
