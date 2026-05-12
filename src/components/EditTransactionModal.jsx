import React, { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/index.jsx';
import CategoryPicker, { dotBg } from './CategoryPicker';
import { getCategoryById } from '../data/categories';
import { inputBase } from '../styles/shared.js';
import Modal from './Modal.jsx';

const formatDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

function EditTransactionModal({ isOpen, transaction, onClose, onSubmit, customCategories = [], onAddCustomCategory }) {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('');
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [recurrence, setRecurrence] = useState('single');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!transaction) {
      setDescription('');
      setAmount('');
      setDate('');
      setType('income');
      setCategory('');
      setRecurrence('single');
      return;
    }

    const sanitizedDescription = transaction.recurrence === 'installment'
      ? transaction.description.replace(/\s\(\d+\/\d+\)$/u, '')
      : transaction.description;

    setDescription(sanitizedDescription);
    setAmount(Math.abs(transaction.amount).toString());
    setDate(formatDateInput(transaction.createdAt));
    setType(transaction.type);
    setCategory(transaction.category || '');
    setRecurrence(transaction.recurrence);
  }, [transaction, isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedDescription = description.trim();
    const numericAmount = parseFloat(amount);

    if (!trimmedDescription || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Por favor, preencha todos os campos corretamente.');
      return;
    }
    if (!date) {
      setFormError('Por favor, selecione uma data válida.');
      return;
    }
    setFormError('');
    onSubmit({
      id: transaction.id,
      description: trimmedDescription,
      amount: numericAmount,
      type,
      category,
      date,
      recurrence,
    });
  };

  return (
    <Modal
      isOpen={isOpen && !!transaction}
      onClose={onClose}
      cardClassName="modal-container animate-slide-up w-full sm:max-w-md bg-white dark:bg-[#1E1D1C] rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto"
    >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#1E1D1C] z-10 flex justify-between items-center px-6 pt-6 pb-4 border-b border-[#E8E5E0] dark:border-[#2D2B28]">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#E8E4DF]">Editar Transação</h2>
            <p className="text-xs text-[#9B9B9B] dark:text-[#6B6560] mt-0.5">Altere os dados abaixo</p>
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
        <form className="px-6 py-5 space-y-5" onSubmit={handleSubmit}>
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-[#9B2226] dark:text-[#E76F51] text-sm">
              {formError}
            </div>
          )}
          {/* Description */}
          <div>
            <label htmlFor="edit-description" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1.5 block">
              Descrição
            </label>
            <input
              id="edit-description"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex.: Salário, Aluguel..."
              className={inputBase}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1.5 block">
              {t('form.category.label')}
            </label>
            <button
              type="button"
              onClick={() => setCategoryPickerOpen(true)}
              className={`${inputBase} flex items-center gap-2 text-left`}
            >
              {category ? (() => {
                const cat = getCategoryById(category, customCategories);
                const dot = dotBg[cat?.color] || dotBg.slate;
                return (
                  <>
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                    <span>{cat?.label || t(`categories.${category}`)}</span>
                  </>
                );
              })() : (
                <span className="text-[#9B9B9B] dark:text-[#6B6560]">{t('form.category.placeholder')}</span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto text-[#9B9B9B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Value + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-amount" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1.5 block">
                Valor (R$)
              </label>
              <input
                id="edit-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0,00"
                className={inputBase}
                required
              />
            </div>
            <div>
              <label htmlFor="edit-date" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1.5 block">
                Data
              </label>
              <input
                id="edit-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={`${inputBase} text-left`}
                style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                required
              />
            </div>
          </div>

          {/* Type toggle */}
          <div>
            <label className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1.5 block">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="custom-radio">
                <input
                  id="edit-type-income"
                  type="radio"
                  name="edit-type"
                  value="income"
                  className="sr-only"
                  checked={type === 'income'}
                  onChange={() => setType('income')}
                />
                <label
                  htmlFor="edit-type-income"
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#E8E5E0] dark:border-[#2D2B28] rounded-xl cursor-pointer font-medium text-sm text-[#6B6B6B] dark:text-[#A09A92] hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] transition duration-200 min-h-[44px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Renda
                </label>
              </div>
              <div className="custom-radio custom-radio-expense">
                <input
                  id="edit-type-expense"
                  type="radio"
                  name="edit-type"
                  value="expense"
                  className="sr-only"
                  checked={type === 'expense'}
                  onChange={() => setType('expense')}
                />
                <label
                  htmlFor="edit-type-expense"
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#E8E5E0] dark:border-[#2D2B28] rounded-xl cursor-pointer font-medium text-sm text-[#6B6B6B] dark:text-[#A09A92] hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] transition duration-200 min-h-[44px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                  </svg>
                  Despesa
                </label>
              </div>
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label htmlFor="edit-recurrence" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1.5 block">
              Recorrência
            </label>
            <select
              id="edit-recurrence"
              value={recurrence}
              onChange={(event) => setRecurrence(event.target.value)}
              className={inputBase}
            >
              <option value="single">Única</option>
              <option value="monthly">Mensal (Recorrente)</option>
              <option value="installment">Parcelada</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#F4F3EF] dark:bg-[#2D2B28] text-[#1A1A1A] dark:text-[#E8E4DF] font-semibold py-3 px-4 rounded-xl hover:bg-[#E8E5E0] dark:hover:bg-[#3A3835] transition min-h-[44px] text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#153B52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4965] transition min-h-[44px] text-sm"
              style={{ background: 'var(--accent)' }}
            >
              Salvar Alterações
            </button>
          </div>
        </form>

        <CategoryPicker
          isOpen={categoryPickerOpen}
          selected={category}
          onSelect={setCategory}
          onClose={() => setCategoryPickerOpen(false)}
          transactionType={type}
          customCategories={customCategories}
          onAddCustomCategory={onAddCustomCategory}
        />
    </Modal>
  );
}

export default EditTransactionModal;
