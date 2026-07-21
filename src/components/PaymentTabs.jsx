import React from 'react';

const tabs = [
  { value: 'all', label: 'Todos' },
  { value: 'pix', label: 'Pix' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'boleto', label: 'Boleto' },
];

function PaymentTabs({ currentPaymentFilter, onChange }) {
  const handleClick = (event) => {
    const filter = event.currentTarget.dataset.paymentFilter;
    onChange(filter);
  };

  return (
    <div id="payment-tabs-container" className="border-b border-[#E8E5E0] dark:border-[#2D2B28] pb-2">
      <nav className="-mb-px flex gap-4 text-sm font-medium overflow-x-auto" aria-label="Filtro por método de pagamento">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            data-payment-filter={tab.value}
            onClick={handleClick}
            className={`payment-tab whitespace-nowrap py-2 px-1 border-b-2 font-medium text-[#6B6B6B] hover:text-[#1A1A1A] dark:text-[#A09A92] dark:hover:text-[#E8E4DF] border-transparent ${
              currentPaymentFilter === tab.value ? 'active' : ''
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default PaymentTabs;
