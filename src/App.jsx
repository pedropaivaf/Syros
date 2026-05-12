import React, { useEffect, useMemo, useState, useCallback } from 'react';

// Componentes existentes
import GoalsSection from './components/GoalsSection.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import ChartSection from './components/ChartSection.jsx';
import FilterBar from './components/FilterBar.jsx';
import PaymentTabs from './components/PaymentTabs.jsx';
import TransactionList from './components/TransactionList.jsx';
import EditTransactionModal from './components/EditTransactionModal.jsx';
import PaymentModal from './components/PaymentModal.jsx';
import ConfirmDeleteModal from './components/ConfirmDeleteModal.jsx';
import DeleteChoiceModal from './components/DeleteChoiceModal.jsx';
import EditChoiceModal from './components/EditChoiceModal.jsx';
import EditAllValueModal from './components/EditAllValueModal.jsx';
import TransactionSuccessModal from './components/TransactionSuccessModal.jsx';

// Premium
import InsightsSection from './components/InsightsSection.jsx';
import EnvelopesSection from './components/EnvelopesSection.jsx';
import UpcomingBillsSection from './components/UpcomingBillsSection.jsx';
import CreditCardsSection from './components/CreditCardsSection.jsx';
import AdvancedAnalytics from './components/AdvancedAnalytics.jsx';
import ExportSection from './components/ExportSection.jsx';
import SettingsSection from './components/SettingsSection.jsx';

// Overview sections
import OverviewMiniChart from './components/OverviewMiniChart.jsx';
import OverviewCategoryBreakdown from './components/OverviewCategoryBreakdown.jsx';
import OverviewRecentTransactions from './components/OverviewRecentTransactions.jsx';

// Auth & pages
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import ForgotPasswordPage from './components/ForgotPasswordPage.jsx';
import ResetPasswordPage from './components/ResetPasswordPage.jsx';
import DesktopSidebar from './components/DesktopSidebar.jsx';

// i18n
import { useTranslation } from './i18n/index.jsx';

// Auth
import { useAuth } from './contexts/AuthContext.jsx';

// Supabase services
import {
  dbLoadTransactions,
  dbAddTransactions,
  dbUpdateTransaction,
  dbDeleteTransaction,
  dbDeleteTransactionsByGroup,
  dbClearAllTransactions,
  dbLoadGoals,
  dbSaveGoals,
  dbLoadEnvelopes,
  dbSaveEnvelopes,
  dbLoadCards,
  dbSaveCards,
  dbLoadUserPreferences,
  dbSaveUserPreferences,
} from './services/supabaseService.js';

import { migrateLocalStorageToSupabase, hasLocalData } from './services/migrationService.js';
import { setCurrentPlan, getCurrentPlan, isPremiumActive } from './config.js';
import { initPurchases, getCustomerInfo, extractPremiumPayload } from './services/purchases.js';
import { isReturningFromCheckout, clearCheckoutQueryParam } from './services/checkout.js';
import { loadNotificationPrefs, runNotificationChecks } from './services/notificationService.js';
import { calculateTotals } from './utils/calculations.js';

import { SyrosLogo } from './components/Header.jsx';

function NavTab({ target, label, activePage, onNavigate, children }) {
  const isActive = activePage === target;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => onNavigate(target)}
      className={`nav-tab-item flex flex-col items-center justify-center gap-[3px] min-w-[48px] min-h-[44px] text-[10px] tracking-wide transition-all duration-300 focus:outline-none ${
        isActive ? 'nav-tab-active' : 'text-[#9B9B9B] dark:text-[#6B6560]'
      }`}
    >
      {isActive && <span className="nav-tab-indicator" />}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-[22px] w-[22px] transition-all duration-300 ${isActive ? 'scale-105' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={isActive ? 2.2 : 1.6}
      >
        {children}
      </svg>
      <span className={`transition-all duration-300 leading-none ${isActive ? 'font-semibold opacity-100' : 'font-medium opacity-70'}`}>{label}</span>
    </button>
  );
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number.isFinite(value) ? value : 0);

const generateProcessedTransactions = (transactions) => {
  const today = new Date();
  const projectionEndDate = new Date(today.getFullYear() + 1, 11, 31);
  const processed = [...transactions];
  const signatures = new Set();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const signature = `${transaction.sourceOf || transaction.id}-${date.getFullYear()}-${date.getMonth()}`;
    signatures.add(signature);
  });

  transactions.forEach((transaction) => {
    if (transaction.recurrence === 'monthly') {
      const startDate = new Date(transaction.createdAt);
      if (Number.isNaN(startDate.getTime())) return;
      const currentDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
      while (currentDate <= projectionEndDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const signature = `${transaction.id}-${year}-${month}`;
        if (!signatures.has(signature)) {
          processed.push({
            ...transaction,
            id: `proj_${transaction.id}_${year}-${month}`,
            createdAt: new Date(currentDate).toISOString(),
            isProjection: true,
            paid: false,
            sourceOf: transaction.id,
          });
        }
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
  });

  return processed;
};

const filterByMonth = (transactions, year, month) => {
  const startTime = new Date(year, month, 1).getTime();
  const endTime = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
  return transactions.filter((tx) => {
    const date = new Date(tx.createdAt);
    if (Number.isNaN(date.getTime())) return false;
    const t = date.getTime();
    return t >= startTime && t <= endTime;
  });
};

const filterByCycle = (transactions, cycleDay, referenceYear, referenceMonth) => {
  const day = parseInt(cycleDay) || 1;
  const start = new Date(referenceYear, referenceMonth, day);
  const end = new Date(referenceYear, referenceMonth + 1, day - 1, 23, 59, 59, 999);
  const startTime = start.getTime();
  const endTime = end.getTime();
  return transactions.filter((tx) => {
    const date = new Date(tx.createdAt);
    if (Number.isNaN(date.getTime())) return false;
    const t = date.getTime();
    return t >= startTime && t <= endTime;
  });
};

function AppContent() {
  const { t, lang } = useTranslation();
  const { user, signOut } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState({ incomeGoal: '', expenseGoal: '' });
  const [currentFilter, setCurrentFilter] = useState('month');
  const [currentPaymentFilter, setCurrentPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [overviewFilter, setOverviewFilter] = useState('month');
  const [overviewDateRange, setOverviewDateRange] = useState({ from: null, to: null });
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'
  const [valueRange, setValueRange] = useState({ min: 0, max: 0 });
  const [valueRangeActive, setValueRangeActive] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('color-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [summaryOrder, setSummaryOrder] = useState(['income', 'expense', 'paid', 'balance']);
  const [envelopes, setEnvelopes] = useState([]);
  const [cards, setCards] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [billingCycleDay, setBillingCycleDay] = useState(1);
  const [defaultPeriodFilter, setDefaultPeriodFilter] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  const [editModalState, setEditModalState] = useState({ open: false, transaction: null });
  const [paymentModalState, setPaymentModalState] = useState({ open: false, transaction: null, projection: null });
  const [deleteChoiceState, setDeleteChoiceState] = useState({ open: false, transaction: null });
  const [editChoiceState, setEditChoiceState] = useState({ open: false, transaction: null });
  const [editAllValueState, setEditAllValueState] = useState({ open: false, groupId: null });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, type: null });
  const [activePage, setActivePageRaw] = useState('overview');
  const setActivePage = (page) => setActivePageRaw(page === 'wallet' ? 'settings' : page);

  // Load data from Supabase on mount
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadData() {
      // Check for local data migration
      if (hasLocalData()) {
        await migrateLocalStorageToSupabase();
      }

      const [txns, goalsData, envData, cardsData, prefs] = await Promise.all([
        dbLoadTransactions(),
        dbLoadGoals(),
        dbLoadEnvelopes(),
        dbLoadCards(),
        dbLoadUserPreferences(),
      ]);

      if (cancelled) return;

      setTransactions(txns);
      setGoals(goalsData);
      setEnvelopes(envData);
      setCards(cardsData);

      if (prefs) {
        if (prefs.theme === 'dark') setIsDarkMode(true);
        else if (prefs.theme === 'light') setIsDarkMode(false);
        if (prefs.summaryOrder) setSummaryOrder(prefs.summaryOrder);
        setCurrentPlan(isPremiumActive(prefs) ? 'premium' : 'free');
        if (prefs.customCategories) setCustomCategories(prefs.customCategories);
        if (prefs.notificationPrefs?.billingCycleDay) setBillingCycleDay(prefs.notificationPrefs.billingCycleDay);
        if (prefs.notificationPrefs?.defaultPeriodFilter) {
          const df = prefs.notificationPrefs.defaultPeriodFilter;
          setDefaultPeriodFilter(df);
          setCurrentFilter(df);
          setOverviewFilter(df);
        }
      }

      // Native IAP (RevenueCat): identify user and reconcile entitlement.
      // Defensive — the webhook is the real source of truth (Phase 6).
      try {
        await initPurchases(user.id);
        const info = await getCustomerInfo();
        const premium = extractPremiumPayload(info);
        if (premium && !isPremiumActive(prefs)) {
          setCurrentPlan('premium');
          dbSaveUserPreferences(premium);
        }
      } catch (err) {
        console.warn('[purchases] boot reconcile failed', err);
      }

      // Web: if we just returned from Stripe Checkout, the webhook may still
      // be in flight. Refetch once after a short delay to pick up the updated
      // plan before clearing the query param.
      if (isReturningFromCheckout()) {
        clearCheckoutQueryParam();
        // Poll a few times — webhook may take a couple seconds to land.
        // Once we see premium, reload so every component picks up the new plan.
        let attempts = 0;
        const pollPremium = async () => {
          attempts += 1;
          const fresh = await dbLoadUserPreferences();
          if (fresh && isPremiumActive(fresh)) {
            setCurrentPlan('premium');
            window.location.reload();
            return;
          }
          if (attempts < 6) setTimeout(pollPremium, 1500);
        };
        setTimeout(pollPremium, 1000);
      }

      setIsLoading(false);
    }

    loadData();
    return () => { cancelled = true; };
  }, [user]);

  // Dark mode toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('color-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Body class
  useEffect(() => {
    document.body.className =
      'bg-[#FAFAF8] dark:bg-[#111110] text-[#1A1A1A] dark:text-[#E8E4DF] min-h-screen transition-colors duration-500';
  }, []);

  // Notifications
  useEffect(() => {
    if (isLoading) return;
    const prefs = loadNotificationPrefs();
    if (prefs.enabled) {
      runNotificationChecks({ prefs, transactions, envelopes, onUpdatePrefs: () => {}, t });
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Persistence helpers (fire-and-forget to Supabase) ---

  const persistPreferences = useCallback((updates) => {
    dbSaveUserPreferences({
      theme: isDarkMode ? 'dark' : 'light',
      language: localStorage.getItem('smartfinance_language') || 'pt-BR',
      summaryOrder,
      ...updates,
    });
  }, [isDarkMode, summaryOrder]);

  // --- Processed transactions ---

  const processedTransactions = useMemo(
    () => generateProcessedTransactions(transactions),
    [transactions],
  );

  const summaryTransactions = useMemo(() => {
    if (currentFilter === 'month') {
      return filterByMonth(processedTransactions, selectedMonth.year, selectedMonth.month);
    }
    if (currentFilter === 'cycle') {
      return filterByCycle(processedTransactions, billingCycleDay, selectedMonth.year, selectedMonth.month);
    }
    if (currentFilter === 'range' && dateRange.from && dateRange.to) {
      const fromTime = dateRange.from.getTime();
      const toEnd = new Date(dateRange.to);
      toEnd.setHours(23, 59, 59, 999);
      const toTime = toEnd.getTime();
      return processedTransactions.filter((transaction) => {
        const date = new Date(transaction.createdAt);
        if (Number.isNaN(date.getTime())) return false;
        const time = date.getTime();
        return time >= fromTime && time <= toTime;
      });
    }
    return processedTransactions;
  }, [processedTransactions, currentFilter, dateRange, billingCycleDay, selectedMonth]);

  const overviewTransactions = useMemo(() => {
    if (overviewFilter === 'month') {
      return filterByMonth(processedTransactions, selectedMonth.year, selectedMonth.month);
    }
    if (overviewFilter === 'cycle') {
      return filterByCycle(processedTransactions, billingCycleDay, selectedMonth.year, selectedMonth.month);
    }
    if (overviewFilter === 'range' && overviewDateRange.from && overviewDateRange.to) {
      const fromTime = overviewDateRange.from.getTime();
      const toEnd = new Date(overviewDateRange.to);
      toEnd.setHours(23, 59, 59, 999);
      const toTime = toEnd.getTime();
      return processedTransactions.filter((tx) => {
        const date = new Date(tx.createdAt);
        if (Number.isNaN(date.getTime())) return false;
        const time = date.getTime();
        return time >= fromTime && time <= toTime;
      });
    }
    return processedTransactions;
  }, [processedTransactions, overviewFilter, overviewDateRange, billingCycleDay, selectedMonth]);

  const overviewValues = useMemo(
    () => calculateTotals(overviewTransactions),
    [overviewTransactions],
  );

  const maxTransactionAmount = useMemo(() => {
    if (!summaryTransactions.length) return 1000;
    const max = Math.max(...summaryTransactions.map((tx) => Math.abs(tx.amount)));
    return Math.ceil(max / 100) * 100 || 1000;
  }, [summaryTransactions]);

  const listTransactions = useMemo(() => {
    let filtered = summaryTransactions;

    // Payment method filter
    if (currentPaymentFilter !== 'all') {
      filtered = filtered.filter((tx) => tx.paymentMethod === currentPaymentFilter);
    }

    // Type filter (income/expense)
    if (typeFilter !== 'all') {
      filtered = filtered.filter((tx) => tx.type === typeFilter);
    }

    // Value range filter
    if (valueRangeActive) {
      filtered = filtered.filter((tx) => {
        const abs = Math.abs(tx.amount);
        return abs >= valueRange.min && abs <= valueRange.max;
      });
    }

    return filtered;
  }, [summaryTransactions, currentPaymentFilter, typeFilter, valueRange, valueRangeActive]);

  const summaryValues = useMemo(
    () => calculateTotals(summaryTransactions),
    [summaryTransactions],
  );

  // --- Handlers ---

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      persistPreferences({ theme: next ? 'dark' : 'light' });
      return next;
    });
  };

  const handleAddCustomCategory = (cat) => {
    setCustomCategories((prev) => {
      if (prev.some((c) => c.id === cat.id)) return prev;
      const next = [...prev, cat];
      dbSaveUserPreferences({ customCategories: next });
      return next;
    });
  };

  const handleBillingCycleDayChange = (day) => {
    const numDay = parseInt(day) || 1;
    setBillingCycleDay(numDay);
    dbSaveUserPreferences({ notificationPrefs: { billingCycleDay: numDay, defaultPeriodFilter } });
  };

  const handleDefaultPeriodFilterChange = (value) => {
    setDefaultPeriodFilter(value);
    setCurrentFilter(value);
    setOverviewFilter(value);
    dbSaveUserPreferences({ notificationPrefs: { billingCycleDay, defaultPeriodFilter: value } });
  };

  const handleAddTransactions = (newTransactions) => {
    setTransactions((prev) => [...prev, ...newTransactions]);
    dbAddTransactions(newTransactions);
    const txType = newTransactions[0]?.type || 'expense';
    setSuccessModal({ open: true, type: txType });
  };

  const handleImportTransactions = (newTxs) => {
    setTransactions((prev) => [...prev, ...newTxs]);
    dbAddTransactions(newTxs);
  };

  const handleGoalChange = (field, rawValue) => {
    setGoals((prev) => {
      if (rawValue === '') {
        const next = { ...prev, [field]: '' };
        dbSaveGoals(next);
        return next;
      }
      const numeric = Number(rawValue);
      if (Number.isNaN(numeric) || numeric < 0) return prev;
      const next = { ...prev, [field]: rawValue };
      dbSaveGoals(next);
      return next;
    });
  };

  const handleTogglePaid = (transaction, isChecked) => {
    if (isChecked) {
      if (transaction.isProjection) {
        // Materialize the projection as a real paid transaction, keeping original payment info
        const newTransaction = {
          id: Date.now().toString(),
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          createdAt: new Date(transaction.createdAt).toISOString(),
          recurrence: 'single',
          paid: true,
          paymentMethod: transaction.paymentMethod || null,
          creditCardName: transaction.creditCardName || null,
          sourceOf: transaction.sourceOf,
          groupId: transaction.groupId,
        };
        setTransactions((prev) => [...prev, newTransaction]);
        dbAddTransactions([newTransaction]);
      } else {
        const original = transactions.find((item) => item.id === transaction.id);
        if (!original) return;
        setTransactions((prev) =>
          prev.map((item) =>
            item.id === original.id ? { ...item, paid: true } : item,
          ),
        );
        dbUpdateTransaction(original.id, { paid: true });
      }
    } else {
      if (transaction.isProjection) {
        const projDate = new Date(transaction.createdAt);
        const projYear = projDate.getFullYear();
        const projMonth = projDate.getMonth();
        setTransactions((prev) => {
          const toDelete = prev.find((item) => {
            if (item.isProjection) return false;
            if (item.sourceOf !== transaction.sourceOf) return false;
            const itemDate = new Date(item.createdAt);
            return itemDate.getFullYear() === projYear && itemDate.getMonth() === projMonth;
          });
          if (toDelete) dbDeleteTransaction(toDelete.id);
          return prev.filter((item) => !toDelete || item.id !== toDelete.id);
        });
      } else {
        setTransactions((prev) =>
          prev.map((item) =>
            item.id === transaction.id
              ? { ...item, paid: false }
              : item,
          ),
        );
        dbUpdateTransaction(transaction.id, { paid: false });
      }
    }
  };

  const closePaymentModal = () => {
    setPaymentModalState({ open: false, transaction: null, projection: null });
  };

  const handlePaymentConfirm = ({ paymentMethod, creditCardName }) => {
    const normalizedCreditName = paymentMethod === 'credit' ? (creditCardName || null) : null;

    if (paymentModalState.projection) {
      const projection = paymentModalState.projection;
      const newTransaction = {
        id: Date.now().toString(),
        description: projection.description,
        amount: projection.amount,
        type: projection.type,
        category: projection.category,
        createdAt: new Date(projection.createdAt).toISOString(),
        recurrence: 'single',
        paid: true,
        paymentMethod,
        creditCardName: normalizedCreditName,
        sourceOf: projection.sourceOf,
        groupId: projection.groupId,
      };
      setTransactions((prev) => [...prev, newTransaction]);
      dbAddTransactions([newTransaction]);
    } else if (paymentModalState.transaction) {
      const transactionId = paymentModalState.transaction.id;
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === transactionId
            ? { ...item, paid: true, paymentMethod, creditCardName: normalizedCreditName }
            : item,
        ),
      );
      dbUpdateTransaction(transactionId, { paid: true, paymentMethod, creditCardName: normalizedCreditName });
    }

    closePaymentModal();
  };

  const handleDeleteTransactionRequest = (transaction) => {
    if (transaction.isProjection) return;
    const original = transactions.find((item) => item.id === transaction.id);
    if (!original) return;
    if (original.recurrence === 'installment' && original.groupId) {
      setDeleteChoiceState({ open: true, transaction: original });
    } else {
      setTransactions((prev) => prev.filter((item) => item.id !== original.id));
      dbDeleteTransaction(original.id);
    }
  };

  const handleDeleteSingle = () => {
    const target = deleteChoiceState.transaction;
    if (!target) return;
    setTransactions((prev) => prev.filter((item) => item.id !== target.id));
    dbDeleteTransaction(target.id);
    setDeleteChoiceState({ open: false, transaction: null });
  };

  const handleDeleteAll = () => {
    const target = deleteChoiceState.transaction;
    if (!target) return;
    setTransactions((prev) => prev.filter((item) => item.groupId !== target.groupId));
    dbDeleteTransactionsByGroup(target.groupId);
    setDeleteChoiceState({ open: false, transaction: null });
  };

  const closeDeleteChoiceModal = () => {
    setDeleteChoiceState({ open: false, transaction: null });
  };

  const handleEditRequest = (transaction) => {
    if (transaction.isProjection) return;
    const original = transactions.find((item) => item.id === transaction.id);
    if (!original) return;
    if (original.recurrence === 'installment' && original.groupId) {
      setEditChoiceState({ open: true, transaction: original });
    } else {
      setEditModalState({ open: true, transaction: original });
    }
  };

  const handleEditSingle = () => {
    const target = editChoiceState.transaction;
    if (!target) return;
    const original = transactions.find((item) => item.id === target.id);
    if (!original) {
      setEditChoiceState({ open: false, transaction: null });
      return;
    }
    setEditModalState({ open: true, transaction: original });
    setEditChoiceState({ open: false, transaction: null });
  };

  const handleEditAll = () => {
    const target = editChoiceState.transaction;
    if (!target) return;
    setEditAllValueState({ open: true, groupId: target.groupId });
    setEditChoiceState({ open: false, transaction: null });
  };

  const closeEditChoiceModal = () => {
    setEditChoiceState({ open: false, transaction: null });
  };

  const handleEditSubmit = ({ id, description, amount, type, category, date, recurrence }) => {
    setTransactions((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const signedAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
        let updatedDescription = description;
        if (item.recurrence === 'installment' && !/\s\(\d+\/\d+\)$/u.test(description)) {
          const match = item.description.match(/\s(\(\d+\/\d+\))$/u);
          if (match) updatedDescription = `${description} ${match[1]}`;
        }
        const updates = {
          description: updatedDescription,
          amount: signedAmount,
          type,
          category: category || '',
          createdAt: new Date(`${date}T12:00:00`).toISOString(),
          recurrence,
        };
        dbUpdateTransaction(id, updates);
        return { ...item, ...updates };
      }),
    );
    setEditModalState({ open: false, transaction: null });
  };

  const handleEditAllSubmit = (newValue) => {
    if (!editAllValueState.groupId) return;
    const negativeValue = -Math.abs(newValue);
    setTransactions((prev) =>
      prev.map((item) => {
        if (item.groupId === editAllValueState.groupId && !item.paid) {
          dbUpdateTransaction(item.id, { amount: negativeValue });
          return { ...item, amount: negativeValue };
        }
        return item;
      }),
    );
    setEditAllValueState({ open: false, groupId: null });
  };

  const closeEditAllModal = () => {
    setEditAllValueState({ open: false, groupId: null });
  };

  const handleClearAllRequest = () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDeleteAll = () => {
    setTransactions([]);
    dbClearAllTransactions();
    setConfirmDeleteOpen(false);
  };

  const handleCancelDeleteAll = () => {
    setConfirmDeleteOpen(false);
  };

  const handleSaveEnvelopes = (newEnvelopes) => {
    setEnvelopes(newEnvelopes);
    dbSaveEnvelopes(newEnvelopes);
  };

  const handleSaveCards = (newCards) => {
    setCards(newCards);
    dbSaveCards(newCards);
  };

  const handleSummaryReorder = (newOrder) => {
    setSummaryOrder(newOrder);
    persistPreferences({ summaryOrder: newOrder });
  };

  const panelClasses = '';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto animate-pulse"><SyrosLogo className="h-16 w-16" /></div>
          <p className="text-sm text-[#9B9B9B] dark:text-[#6B6560]">{t('app.loading') || 'Carregando...'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <DesktopSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        userEmail={user?.email}
        onSignOut={signOut}
      />

      <main className="w-full mx-auto px-3 sm:px-6 lg:pl-72 lg:pr-10 max-w-lg lg:max-w-full pb-28 lg:pb-8 space-y-5 sm:space-y-6 pt-6 lg:pt-10">
        {/* OVERVIEW */}
        <section
          id="page-overview"
          data-page="overview"
          className={`page-section space-y-5 ${activePage === 'overview' ? '' : 'hidden'}`}
        >
          <div className={`${panelClasses} p-5 sm:p-6 space-y-4`}>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.08em] text-[#9B9B9B] dark:text-[#6B6560]">{t('page.overview.overline')}</p>
              <h2 className="text-lg font-display text-[#1A1A1A] dark:text-[#E8E4DF]">{t('page.overview.title')}</h2>
            </div>
            <FilterBar
              currentFilter={overviewFilter}
              onChange={setOverviewFilter}
              dateRange={overviewDateRange}
              onDateRangeChange={setOverviewDateRange}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              showTitle={false}
            />
            <p className="text-xs text-[#9B9B9B] dark:text-[#6B6560]">{t('page.overview.drag')}</p>
            <SummaryCards
              totalIncome={overviewValues.income}
              totalExpense={overviewValues.totalExpense}
              totalPaid={overviewValues.paidExpense}
              balance={overviewValues.balance}
              formatCurrency={formatCurrency}
              cardOrder={summaryOrder}
              onReorder={handleSummaryReorder}
            />
          </div>
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-5 lg:space-y-0">
            <OverviewMiniChart
              transactions={overviewTransactions}
              isDarkMode={isDarkMode}
              formatCurrency={formatCurrency}
            />
            <OverviewCategoryBreakdown
              transactions={overviewTransactions}
              formatCurrency={formatCurrency}
              customCategories={customCategories}
            />
          </div>
          <OverviewRecentTransactions
            transactions={overviewTransactions}
            formatCurrency={formatCurrency}
            onNavigate={setActivePage}
            customCategories={customCategories}
          />
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-5 lg:space-y-0">
            <InsightsSection transactions={overviewTransactions} envelopes={envelopes} />
            <UpcomingBillsSection transactions={processedTransactions} />
          </div>
        </section>

        {/* GRAPHS & GOALS */}
        <section
          id="page-graphs-goals"
          data-page="graphs-goals"
          className={`page-section space-y-5 ${activePage === 'graphs-goals' ? '' : 'hidden'}`}
        >
          <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-5 lg:space-y-0">
            <div className={`${panelClasses} p-5 sm:p-6 space-y-4`}>
              <ChartSection transactions={summaryTransactions} isDarkMode={isDarkMode} />
            </div>
            <div className={`${panelClasses} p-5 sm:p-6 space-y-4`}>
              <GoalsSection
                goals={goals}
                onGoalChange={handleGoalChange}
                summaryValues={summaryValues}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>
          <EnvelopesSection
            transactions={summaryTransactions}
            envelopes={envelopes}
            onSaveEnvelopes={handleSaveEnvelopes}
          />
          <AdvancedAnalytics transactions={summaryTransactions} customCategories={customCategories} />
        </section>

        {/* HISTORY */}
        <section
          id="page-history"
          data-page="history"
          className={`page-section space-y-5 ${activePage === 'history' ? '' : 'hidden'}`}
        >
          <div className={`${panelClasses} p-5 sm:p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-[#9B9B9B] dark:text-[#6B6560]">{t('page.history.overline')}</p>
                <h3 className="text-lg font-display text-[#1A1A1A] dark:text-[#E8E4DF]">{t('page.history.title')}</h3>
              </div>
            </div>
            <FilterBar
              currentFilter={currentFilter}
              onChange={setCurrentFilter}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              showTitle={false}
            />
            <div className="border-b border-[#E8E5E0] dark:border-[#2D2B28]" />
            <PaymentTabs currentPaymentFilter={currentPaymentFilter} onChange={setCurrentPaymentFilter} />
            {/* Advanced filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type filter */}
              {['all', 'income', 'expense'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    typeFilter === type
                      ? type === 'income' ? 'bg-[#1B4965] text-white' : type === 'expense' ? 'bg-[#9B2226] text-white' : 'bg-[#1B4965] text-white'
                      : 'bg-[#F4F3EF] dark:bg-[#1A1918] text-[#6B6B6B] dark:text-[#A09A92] hover:bg-[#E8E5E0] dark:hover:bg-[#2D2B28]'
                  }`}
                >
                  {type === 'all' ? 'Todos' : type === 'income' ? 'Recebidos' : 'Gastos'}
                </button>
              ))}
              {/* Value range slider */}
              <button
                type="button"
                onClick={() => {
                  if (!valueRangeActive) {
                    setValueRange({ min: 0, max: maxTransactionAmount });
                    setValueRangeActive(true);
                  } else {
                    setValueRangeActive(false);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  valueRangeActive
                    ? 'bg-[#1B4965] text-white'
                    : 'bg-[#F4F3EF] dark:bg-[#1A1918] text-[#6B6B6B] dark:text-[#A09A92] hover:bg-[#E8E5E0] dark:hover:bg-[#2D2B28]'
                }`}
              >
                Faixa de valor
              </button>
              {/* Clear filters */}
              {(typeFilter !== 'all' || valueRangeActive) && (
                <button
                  type="button"
                  onClick={() => { setTypeFilter('all'); setValueRangeActive(false); setValueRange({ min: 0, max: 0 }); }}
                  className="px-2 py-1.5 text-xs text-[#9B9B9B] hover:text-[#9B2226] dark:hover:text-[#E76F51] transition"
                >
                  Limpar filtros
                </button>
              )}
            </div>
            {/* Value range slider panel */}
            {valueRangeActive && (() => {
              const pctMin = (valueRange.min / maxTransactionAmount) * 100;
              const pctMax = (valueRange.max / maxTransactionAmount) * 100;
              const step = Math.max(1, Math.round(maxTransactionAmount / 100));

              const getValueFromEvent = (e, trackEl) => {
                if (!trackEl) return null;
                const rect = trackEl.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                return Math.round((pct * maxTransactionAmount) / step) * step;
              };

              const handleTrackInteraction = (e) => {
                const track = e.currentTarget;
                const val = getValueFromEvent(e, track);
                if (val === null) return;

                // Decide which thumb to move: the closest one
                const distMin = Math.abs(val - valueRange.min);
                const distMax = Math.abs(val - valueRange.max);
                const movingMin = distMin <= distMax;

                const update = (ev) => {
                  const v = getValueFromEvent(ev, track);
                  if (v === null) return;
                  if (movingMin) {
                    setValueRange((prev) => ({ ...prev, min: Math.min(v, prev.max) }));
                  } else {
                    setValueRange((prev) => ({ ...prev, max: Math.max(v, prev.min) }));
                  }
                };

                update(e);

                const onMove = (ev) => { ev.preventDefault(); update(ev); };
                const onEnd = () => {
                  document.removeEventListener('mousemove', onMove);
                  document.removeEventListener('mouseup', onEnd);
                  document.removeEventListener('touchmove', onMove);
                  document.removeEventListener('touchend', onEnd);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onEnd);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('touchend', onEnd);
              };

              return (
                <div className="bg-[#F4F3EF] dark:bg-[#1A1918] rounded-xl px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="bg-white dark:bg-[#2D2B28] rounded-lg px-2.5 py-1 shadow-sm">
                      <span className="text-xs font-semibold text-[#1B4965] dark:text-[#5FA8D3]">{formatCurrency(valueRange.min)}</span>
                    </div>
                    <span className="text-[10px] font-medium text-[#9B9B9B] dark:text-[#6B6560] uppercase tracking-wider">min — max</span>
                    <div className="bg-white dark:bg-[#2D2B28] rounded-lg px-2.5 py-1 shadow-sm">
                      <span className="text-xs font-semibold text-[#1B4965] dark:text-[#5FA8D3]">{formatCurrency(valueRange.max)}</span>
                    </div>
                  </div>
                  {/* Track */}
                  <div
                    className="relative h-10 flex items-center cursor-pointer select-none touch-none"
                    onMouseDown={handleTrackInteraction}
                    onTouchStart={handleTrackInteraction}
                  >
                    {/* Background track */}
                    <div className="absolute inset-x-0 h-2 bg-[#E8E5E0] dark:bg-[#3A3835] rounded-full" />
                    {/* Active range fill */}
                    <div
                      className="absolute h-2 bg-gradient-to-r from-[#1B4965] to-[#1B4965] rounded-full transition-[left,right] duration-75"
                      style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
                    />
                    {/* Min thumb */}
                    <div
                      className="absolute w-6 h-6 -ml-3 rounded-full bg-white dark:bg-[#E8E4DF] shadow-md border-2 border-[#1B4965] dark:border-[#5FA8D3] transition-[left] duration-75 active:scale-110"
                      style={{ left: `${pctMin}%` }}
                    />
                    {/* Max thumb */}
                    <div
                      className="absolute w-6 h-6 -ml-3 rounded-full bg-white dark:bg-[#E8E4DF] shadow-md border-2 border-[#1B4965] dark:border-[#5FA8D3] transition-[left] duration-75 active:scale-110"
                      style={{ left: `${pctMax}%` }}
                    />
                  </div>
                  {/* Scale labels */}
                  <div className="flex justify-between text-[10px] text-[#9B9B9B] dark:text-[#6B6560] -mt-1">
                    <span>R$ 0</span>
                    <span>{formatCurrency(maxTransactionAmount / 2)}</span>
                    <span>{formatCurrency(maxTransactionAmount)}</span>
                  </div>
                </div>
              );
            })()}
            {/* Result count */}
            <p className="text-xs text-[#9B9B9B] dark:text-[#6B6560]">
              {listTransactions.length} transação{listTransactions.length !== 1 ? 'ões' : ''} encontrada{listTransactions.length !== 1 ? 's' : ''}
            </p>
            <TransactionList
              transactions={listTransactions}
              onTogglePaid={handleTogglePaid}
              onEdit={handleEditRequest}
              onDelete={handleDeleteTransactionRequest}
              formatCurrency={(value) => formatCurrency(value)}
              customCategories={customCategories}
            />
          </div>
        </section>

        {/* NEW TRANSACTION */}
        <section
          id="page-new-transaction"
          data-page="new-transaction"
          className={`page-section space-y-5 ${activePage === 'new-transaction' ? '' : 'hidden'}`}
        >
          <div className={`${panelClasses} p-5 sm:p-6 space-y-4 lg:max-w-3xl`}>
            <p className="text-xs uppercase tracking-[0.08em] text-[#9B9B9B] dark:text-[#6B6560]">{t('page.new.overline')}</p>
            <TransactionForm onAddTransactions={handleAddTransactions} customCategories={customCategories} onAddCustomCategory={handleAddCustomCategory} cards={cards} />
          </div>
        </section>

        {/* SETTINGS */}
        <section
          id="page-settings"
          data-page="settings"
          className={`page-section space-y-5 ${activePage === 'settings' ? '' : 'hidden'}`}
        >
          <SettingsSection
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
            transactions={transactions}
            onClearAll={handleClearAllRequest}
            onImportTransactions={handleImportTransactions}
            userEmail={user?.email}
            onSignOut={signOut}
            billingCycleDay={billingCycleDay}
            onBillingCycleDayChange={handleBillingCycleDayChange}
            defaultPeriodFilter={defaultPeriodFilter}
            onDefaultPeriodFilterChange={handleDefaultPeriodFilterChange}
            cards={cards}
            onSaveCards={handleSaveCards}
            selectedMonth={selectedMonth}
          />
        </section>
      </main>

      {/* BOTTOM NAV — mobile only */}
      <nav id="bottom-nav" className="fixed bottom-0 inset-x-0 z-30 lg:hidden">
        <div className="mx-auto max-w-lg">
          <div className="nav-glass flex items-end justify-evenly px-2 pt-2 pb-1">
            <NavTab target="overview" label={t('nav.home')} activePage={activePage} onNavigate={setActivePage}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </NavTab>
            <NavTab target="graphs-goals" label={t('nav.chart')} activePage={activePage} onNavigate={setActivePage}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3v18M6 8v13M16 13v8" />
            </NavTab>
            <button
              type="button"
              aria-label={t('nav.new')}
              onClick={() => setActivePage('new-transaction')}
              className="nav-tab-item flex flex-col items-center justify-center gap-0.5 min-w-[48px] -mt-5 focus:outline-none"
            >
              <span className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                activePage === 'new-transaction'
                  ? 'fab-active shadow-lg shadow-[#1B4965]/30 scale-105'
                  : 'fab-button shadow-md'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                </svg>
              </span>
              <span className={`text-[10px] leading-none ${
                activePage === 'new-transaction' ? 'font-bold text-[#1B4965] dark:text-[#5FA8D3]' : 'text-[#9B9B9B] dark:text-[#6B6560]'
              }`}>{t('nav.new')}</span>
            </button>
            <NavTab target="history" label={t('nav.history')} activePage={activePage} onNavigate={setActivePage}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </NavTab>
            <NavTab target="settings" label={t('nav.config')} activePage={activePage} onNavigate={setActivePage}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </NavTab>
          </div>
        </div>
      </nav>

      {/* MODALS */}
      <EditTransactionModal
        isOpen={editModalState.open}
        transaction={editModalState.transaction}
        onClose={() => setEditModalState({ open: false, transaction: null })}
        onSubmit={handleEditSubmit}
        customCategories={customCategories}
        onAddCustomCategory={handleAddCustomCategory}
      />
      <PaymentModal
        isOpen={paymentModalState.open}
        onClose={closePaymentModal}
        onConfirm={handlePaymentConfirm}
        cards={cards}
      />
      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        onCancel={handleCancelDeleteAll}
        onConfirm={handleConfirmDeleteAll}
      />
      <DeleteChoiceModal
        isOpen={deleteChoiceState.open}
        onClose={closeDeleteChoiceModal}
        onDeleteSingle={handleDeleteSingle}
        onDeleteAll={handleDeleteAll}
      />
      <EditChoiceModal
        isOpen={editChoiceState.open}
        onClose={closeEditChoiceModal}
        onEditSingle={handleEditSingle}
        onEditAll={handleEditAll}
      />
      <EditAllValueModal
        isOpen={editAllValueState.open}
        onClose={closeEditAllModal}
        onSubmit={handleEditAllSubmit}
      />
      <TransactionSuccessModal
        isOpen={successModal.open}
        transactionType={successModal.type}
        onClose={() => setSuccessModal({ open: false, type: null })}
      />
    </>
  );
}

function App() {
  const { t } = useTranslation();
  const { user, loading, isPasswordRecovery, setIsPasswordRecovery, signIn, signUp, signOut, resetPassword, updatePassword } = useAuth();
  const [authPage, setAuthPage] = useState('login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] dark:bg-[#111110]">
        <div className="text-center space-y-4">
          <div className="mx-auto animate-pulse"><SyrosLogo className="h-16 w-16" /></div>
          <p className="text-sm text-[#9B9B9B] dark:text-[#6B6560]">{t('app.loading') || 'Carregando...'}</p>
        </div>
      </div>
    );
  }

  if (isPasswordRecovery) {
    return (
      <ResetPasswordPage
        onUpdatePassword={updatePassword}
        onDone={() => setIsPasswordRecovery(false)}
      />
    );
  }

  if (!user) {
    if (authPage === 'register') {
      return (
        <RegisterPage
          onSignUp={signUp}
          onSwitchToLogin={() => setAuthPage('login')}
        />
      );
    }
    if (authPage === 'forgot-password') {
      return (
        <ForgotPasswordPage
          onResetPassword={resetPassword}
          onSwitchToLogin={() => setAuthPage('login')}
        />
      );
    }
    return (
      <LoginPage
        onSignIn={signIn}
        onSwitchToRegister={() => setAuthPage('register')}
        onSwitchToForgotPassword={() => setAuthPage('forgot-password')}
      />
    );
  }

  return <AppContent />;
}

export default App;
