import React, { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { inputBase } from '../styles/shared.js';

const CARD_CLASS = 'modal-container animate-slide-up w-full sm:max-w-md bg-white dark:bg-[#1E1D1C] rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto';

function PaymentModal({ isOpen, onClose, onConfirm, cards = [] }) {
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [creditCardName, setCreditCardName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('pix');
      setCreditCardName('');
    }
  }, [isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedCreditName = creditCardName.trim();
    onConfirm({
      paymentMethod,
      creditCardName: paymentMethod === 'credit' ? trimmedCreditName : null,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} cardClassName={CARD_CLASS}>
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-[#1E1D1C] z-10 flex justify-between items-center px-6 pt-6 pb-4 border-b border-[#E8E5E0] dark:border-[#2D2B28]">
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#E8E4DF]">Confirmar Pagamento</h2>
          <p className="text-xs text-[#9B9B9B] dark:text-[#6B6560] mt-0.5">Selecione a forma de pagamento</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 -mr-2 rounded-full text-[#9B9B9B] hover:text-[#1A1A1A] dark:hover:text-[#E8E4DF] hover:bg-[#F4F3EF] dark:hover:bg-[#2D2B28] transition min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form */}
      <form className="px-6 py-5 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2.5">
          <div className="custom-radio">
            <input id="payment-pix" type="radio" name="payment-method" value="pix" className="sr-only" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} />
            <label htmlFor="payment-pix" className="w-full flex items-center gap-3 px-4 py-3 border-2 border-[#E8E5E0] dark:border-[#2D2B28] rounded-xl cursor-pointer font-medium text-sm text-[#1A1A1A] dark:text-[#E8E4DF] hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] transition duration-200 min-h-[44px]">
              Pix
            </label>
          </div>
          <div className="custom-radio">
            <input id="payment-debit" type="radio" name="payment-method" value="debit" className="sr-only" checked={paymentMethod === 'debit'} onChange={() => setPaymentMethod('debit')} />
            <label htmlFor="payment-debit" className="w-full flex items-center gap-3 px-4 py-3 border-2 border-[#E8E5E0] dark:border-[#2D2B28] rounded-xl cursor-pointer font-medium text-sm text-[#1A1A1A] dark:text-[#E8E4DF] hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] transition duration-200 min-h-[44px]">
              Cartão (Débito)
            </label>
          </div>
          <div className="custom-radio">
            <input id="payment-credit" type="radio" name="payment-method" value="credit" className="sr-only" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} />
            <label htmlFor="payment-credit" className="w-full flex items-center gap-3 px-4 py-3 border-2 border-[#E8E5E0] dark:border-[#2D2B28] rounded-xl cursor-pointer font-medium text-sm text-[#1A1A1A] dark:text-[#E8E4DF] hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] transition duration-200 min-h-[44px]">
              Cartão (Crédito)
            </label>
          </div>
          {paymentMethod === 'credit' && (
            <div className="pl-1 pt-1">
              <label htmlFor="credit-card-name" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1.5 block">
                {cards.length > 0 ? 'Selecione o Cartão' : 'Nome do Cartão (Opcional)'}
              </label>
              {cards.length > 0 ? (
                <select
                  id="credit-card-name"
                  value={creditCardName}
                  onChange={(event) => setCreditCardName(event.target.value)}
                  className={inputBase}
                >
                  <option value="">Selecione...</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.name}>{card.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="credit-card-name"
                  type="text"
                  value={creditCardName}
                  onChange={(event) => setCreditCardName(event.target.value)}
                  placeholder="Ex: Nubank"
                  className={inputBase}
                />
              )}
            </div>
          )}
          <div className="custom-radio">
            <input id="payment-cash" type="radio" name="payment-method" value="cash" className="sr-only" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
            <label htmlFor="payment-cash" className="w-full flex items-center gap-3 px-4 py-3 border-2 border-[#E8E5E0] dark:border-[#2D2B28] rounded-xl cursor-pointer font-medium text-sm text-[#1A1A1A] dark:text-[#E8E4DF] hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] transition duration-200 min-h-[44px]">
              Dinheiro
            </label>
          </div>
        </div>
        <div className="pt-2 pb-2">
          <button
            type="submit"
            className="w-full text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#153B52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4965] transition min-h-[44px] text-sm"
            style={{ background: 'var(--accent)' }}
          >
            Confirmar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PaymentModal;
