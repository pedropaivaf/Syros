/**
 * CreditCardsSection Component
 *
 * Gerenciamento de cartões de crédito e faturas
 * Feature Premium
 */

import React, { useState, useMemo } from 'react';
import PremiumBadge from './PremiumBadge';
import PremiumCard from './PremiumCard';
import { hasFeature } from '../config';
import { calculateCardSummary } from '../utils/calculations';

export default function CreditCardsSection({ transactions, cards, onSaveCards, selectedMonth }) {
  const [isAdding, setIsAdding] = useState(false);
  const [cardError, setCardError] = useState('');
  const [newCard, setNewCard] = useState({
    name: '',
    brand: '',
    limitTotal: '',
    closingDay: '',
    dueDay: '',
  });

  const isPremium = hasFeature('credit_cards');

  // Calcula summary de cada cartão usando o mês selecionado
  const cardsWithSummary = useMemo(() => {
    const month = selectedMonth?.month;
    const year = selectedMonth?.year;
    return cards.map(card => {
      const summary = calculateCardSummary(transactions, card, month, year);
      return { ...card, ...summary };
    });
  }, [cards, transactions, selectedMonth]);

  const handleAddCard = () => {
    if (!newCard.name || !newCard.limitTotal || !newCard.closingDay || !newCard.dueDay) {
      setCardError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setCardError('');

    const card = {
      id: Date.now().toString(),
      name: newCard.name,
      brand: newCard.brand || 'Outros',
      limitTotal: parseFloat(newCard.limitTotal),
      closingDay: parseInt(newCard.closingDay),
      dueDay: parseInt(newCard.dueDay),
    };

    onSaveCards([...cards, card]);
    setNewCard({ name: '', brand: '', limitTotal: '', closingDay: '', dueDay: '' });
    setIsAdding(false);
  };

  const handleDeleteCard = (id) => {
    if (confirm('Deseja realmente excluir este cartão?')) {
      onSaveCards(cards.filter(c => c.id !== id));
    }
  };

  const getUsagePercent = (card) => {
    if (!card.limitTotal) return 0;
    return Math.min((card.currentInvoice / card.limitTotal) * 100, 100);
  };

  const getUsageColor = (percent) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  if (!isPremium) {
    return (
      <PremiumCard
        title="Cartões e Faturas"
        description="Cadastre seus cartões de crédito, acompanhe faturas em tempo real e controle seu limite disponível."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="bg-white/90 dark:bg-[#1E1D1C]/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-[#E8E5E0] dark:border-[#2D2B28]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-[#1A1A1A] dark:text-[#E8E4DF]">
            Cartões de Crédito
          </h2>
          <PremiumBadge size="xs" />
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#1B4965] hover:bg-[#153B52] text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          {isAdding ? 'Cancelar' : '+ Novo'}
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-[#F4F3EF] dark:bg-[#111110]/50 rounded-xl border border-[#E8E5E0] dark:border-[#2D2B28]">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#E8E4DF] mb-1">
                Nome do Cartão *
              </label>
              <input
                type="text"
                value={newCard.name}
                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                placeholder="Ex: Nubank, Inter, C6"
                className="w-full px-3 py-2 rounded-lg border border-[#E8E5E0] dark:border-[#2D2B28] bg-white dark:bg-[#1E1D1C] text-[#1A1A1A] dark:text-[#E8E4DF] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#E8E4DF] mb-1">
                  Limite Total (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newCard.limitTotal}
                  onChange={(e) => setNewCard({ ...newCard, limitTotal: e.target.value })}
                  placeholder="5000"
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E5E0] dark:border-[#2D2B28] bg-white dark:bg-[#1E1D1C] text-[#1A1A1A] dark:text-[#E8E4DF] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#E8E4DF] mb-1">
                  Bandeira
                </label>
                <input
                  type="text"
                  value={newCard.brand}
                  onChange={(e) => setNewCard({ ...newCard, brand: e.target.value })}
                  placeholder="Visa, Master..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E5E0] dark:border-[#2D2B28] bg-white dark:bg-[#1E1D1C] text-[#1A1A1A] dark:text-[#E8E4DF] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#E8E4DF] mb-1">
                  Dia de Fechamento *
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newCard.closingDay}
                  onChange={(e) => setNewCard({ ...newCard, closingDay: e.target.value })}
                  placeholder="10"
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E5E0] dark:border-[#2D2B28] bg-white dark:bg-[#1E1D1C] text-[#1A1A1A] dark:text-[#E8E4DF] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] dark:text-[#E8E4DF] mb-1">
                  Dia de Vencimento *
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newCard.dueDay}
                  onChange={(e) => setNewCard({ ...newCard, dueDay: e.target.value })}
                  placeholder="17"
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E5E0] dark:border-[#2D2B28] bg-white dark:bg-[#1E1D1C] text-[#1A1A1A] dark:text-[#E8E4DF] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4965]"
                />
              </div>
            </div>
            {cardError && (
              <p className="text-sm text-[#9B2226] dark:text-[#E76F51]">{cardError}</p>
            )}
            <button
              onClick={handleAddCard}
              className="w-full bg-[#2D6A4F] hover:bg-[#245840] text-white font-medium py-2 px-4 rounded-lg transition-colors min-h-[44px]"
            >
              Adicionar Cartão
            </button>
          </div>
        </div>
      )}

      {cardsWithSummary.length === 0 ? (
        <p className="text-center text-[#9B9B9B] dark:text-[#6B6560] py-8 text-sm">
          Nenhum cartão cadastrado. Clique em "+ Novo" para começar.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cardsWithSummary.map((card) => {
            const usagePercent = getUsagePercent(card);

            return (
              <div
                key={card.id}
                className="p-5 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-800 dark:to-slate-950 rounded-2xl shadow-lg text-white relative overflow-hidden"
              >
                {/* Card background pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs opacity-75 mb-1">{card.brand || 'Cartão'}</p>
                      <h3 className="font-bold text-lg">{card.name}</h3>
                    </div>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-white/60 hover:text-white text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs opacity-75 mb-1">Fatura Atual</p>
                      <p className="text-2xl font-bold">
                        R$ {card.currentInvoice.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="opacity-75">Limite Disponível</span>
                        <span className="font-medium">{usagePercent.toFixed(0)}% usado</span>
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getUsageColor(usagePercent)} transition-all duration-300`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                      <p className="text-sm font-medium mt-1">
                        R$ {card.limitAvailable.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex justify-between text-xs pt-2 border-t border-white/20">
                      <span className="opacity-75">Fecha dia {card.closingDay}</span>
                      <span className="opacity-75">Vence dia {card.dueDay}</span>
                    </div>

                    {usagePercent >= 80 && (
                      <p className="text-xs bg-red-500/20 border border-red-500/30 rounded-lg px-2 py-1.5 mt-2">
                        ⚠️ Atenção: você já usou {usagePercent.toFixed(0)}% do limite!
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
