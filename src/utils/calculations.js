/**
 * SmartFinance - Cálculos e Business Logic
 *
 * Funções utilitárias para cálculos financeiros,
 * agregações e análises.
 */

/**
 * Calcula totais de transações
 * @param {Array} transactions - Lista de transações
 * @returns {Object} Totais calculados
 */
export function calculateTotals(transactions) {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const paidExpense = transactions
    .filter(t => t.type === 'expense' && t.paid)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = income - paidExpense;

  return { income, totalExpense, paidExpense, balance };
}

/**
 * Calcula progresso de meta
 * @param {number} current - Valor atual
 * @param {number} target - Valor alvo
 * @returns {Object} Progresso e status
 */
export function calculateGoalProgress(current, target) {
  if (!target || target === 0) {
    return { percent: 0, remaining: 0, status: 'no_goal' };
  }

  const percent = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);

  let status = 'in_progress';
  if (percent >= 100) status = 'completed';
  else if (percent >= 90) status = 'almost';
  else if (percent < 50) status = 'far';

  return { percent, remaining, status };
}

/**
 * Agrupa transações por mês/ano
 * @param {Array} transactions - Lista de transações
 * @returns {Object} Transações agrupadas por chave "YYYY-MM"
 */
export function groupTransactionsByMonth(transactions) {
  const groups = {};

  transactions.forEach(transaction => {
    const date = new Date(transaction.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(transaction);
  });

  return groups;
}

/**
 * Calcula gasto por categoria
 * @param {Array} transactions - Lista de transações
 * @param {string} category - Nome da categoria (opcional)
 * @returns {Object} Gastos por categoria
 */
export function calculateExpensesByCategory(transactions) {
  const categories = {};

  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const cat = t.category || 'Sem categoria';
      if (!categories[cat]) {
        categories[cat] = 0;
      }
      categories[cat] += Math.abs(t.amount);
    });

  return categories;
}

/**
 * Retorna top N categorias por gasto
 * @param {Array} transactions - Lista de transações
 * @param {number} limit - Número de categorias a retornar
 * @returns {Array} Array de {category, amount}
 */
export function getTopCategories(transactions, limit = 5) {
  const categoryTotals = calculateExpensesByCategory(transactions);

  return Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

/**
 * Calcula próximos lançamentos (bills) nos próximos N dias
 * @param {Array} transactions - Lista de transações
 * @param {number} days - Número de dias à frente
 * @returns {Array} Lançamentos futuros
 */
export function getUpcomingBills(transactions, days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  return transactions
    .filter(t => {
      if (t.paid) return false;
      const tDate = new Date(t.createdAt);
      return tDate >= today && tDate <= futureDate;
    })
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

/**
 * Calcula resumo de cartão de crédito
 * @param {Array} transactions - Lista de transações
 * @param {Object} card - Objeto do cartão
 * @returns {Object} Resumo do cartão
 */
export function calculateCardSummary(transactions, card, selectedMonth, selectedYear) {
  const today = new Date();
  const refMonth = selectedMonth != null ? selectedMonth : today.getMonth();
  const refYear = selectedYear != null ? selectedYear : today.getFullYear();

  // Transações deste cartão (pagas ou não — todas contam na fatura)
  const cardTransactions = transactions.filter(t =>
    t.type === 'expense' &&
    t.paymentMethod === 'credit' &&
    t.creditCardName === card.name
  );

  const currentMonthTotal = cardTransactions
    .filter(t => {
      const tDate = new Date(t.createdAt);
      return tDate.getMonth() === refMonth && tDate.getFullYear() === refYear;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const limitAvailable = card.limitTotal - currentMonthTotal;

  return {
    currentInvoice: currentMonthTotal,
    limitAvailable,
    closingDay: card.closingDay,
    dueDay: card.dueDay,
  };
}

/**
 * Calcula gasto por envelope
 * @param {Array} transactions - Lista de transações
 * @param {Object} envelope - Objeto do envelope
 * @returns {Object} Status do envelope
 */
export function calculateEnvelopeStatus(transactions, envelope) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const spent = transactions
    .filter(t =>
      t.type === 'expense' &&
      t.category === envelope.category &&
      !t.isProjection &&
      new Date(t.createdAt).getMonth() === currentMonth &&
      new Date(t.createdAt).getFullYear() === currentYear
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const remaining = Math.max(envelope.monthlyLimit - spent, 0);
  const percent = Math.min((spent / envelope.monthlyLimit) * 100, 100);

  let status = 'ok';
  if (percent >= 100) status = 'exceeded';
  else if (percent >= 90) status = 'critical';
  else if (percent >= 80) status = 'warning';

  return { spent, remaining, percent, status };
}

/**
 * Compara mês atual vs anterior
 * @param {Array} transactions - Lista de transações
 * @returns {Object} Comparação
 */
export function compareCurrentVsPreviousMonth(transactions) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.createdAt);
    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  const previousMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.createdAt);
    return tDate.getMonth() === previousMonth && tDate.getFullYear() === previousYear;
  });

  const currentIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const currentExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const previousIncome = previousMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const previousExpense = previousMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    current: { income: currentIncome, expense: currentExpense },
    previous: { income: previousIncome, expense: previousExpense },
    diff: {
      income: currentIncome - previousIncome,
      expense: currentExpense - previousExpense,
    },
  };
}
