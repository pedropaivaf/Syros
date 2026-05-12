import React, { useState, useEffect } from 'react';
import { SMARTFINANCE_CONFIG, isPremium } from '../config.js';
import { exportAllData, importAllData } from '../services/storageService.js';
import { useTranslation, LANGUAGES } from '../i18n/index.jsx';
import LanguagePicker from './LanguagePicker.jsx';
import PrivacyPolicyModal from './PrivacyPolicyModal.jsx';
import PaywallModal from './PaywallModal.jsx';
import OpenFinanceSection from './OpenFinanceSection.jsx';
import CreditCardsSection from './CreditCardsSection.jsx';
import ExportSection from './ExportSection.jsx';
import {
  loadNotificationPrefs,
  saveNotificationPrefs,
  getNotificationPermission,
  requestPermission,
} from '../services/notificationService.js';

// ── Reusable layout components ──────────────────────────────────────────────

function SettingsGroup({ title, children }) {
  return (
    <div className="space-y-1.5 card-animate">
      {title && (
        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-[#1B4965] dark:text-[#5FA8D3]">
          {title}
        </p>
      )}
      <div className="glass-panel rounded-2xl shadow-md shadow-[#1A1A1A]/5 dark:shadow-black/20 overflow-hidden divide-y divide-[#E8E5E0]/80 dark:divide-[#2D2B28]/60">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon, iconBg, label, sublabel, right, onClick, chevron = true, danger = false }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`settings-row-tap w-full flex items-center gap-3 px-4 py-3.5 min-h-[52px] text-left transition-all duration-150 focus:outline-none ${
        onClick
          ? 'hover:bg-[#F4F3EF]/80 dark:hover:bg-[#1A1918]/60 active:bg-[#F4F3EF] dark:active:bg-[#1A1918]'
          : ''
      }`}
    >
      {icon && (
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
            iconBg ||
            (danger
              ? 'bg-red-100 dark:bg-red-900/40'
              : 'bg-[#F4F3EF] dark:bg-[#1A1918]')
          }`}
        >
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            danger
              ? 'text-[#9B2226] dark:text-[#E76F51]'
              : 'text-[#1A1A1A] dark:text-[#E8E4DF]'
          }`}
        >
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-[#6B6B6B] dark:text-[#A09A92] truncate mt-0.5">{sublabel}</p>
        )}
      </div>
      {right && (
        <div className="flex-shrink-0 text-[#9B9B9B] dark:text-[#6B6560] text-sm">{right}</div>
      )}
      {chevron && onClick && !right && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-[#D4D0C8] dark:text-[#3A3835] flex-shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </Tag>
  );
}

// ── iOS-style toggle switch ─────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`toggle-switch relative w-12 h-7 rounded-full focus:outline-none ${
        checked
          ? 'bg-[#1B4965] shadow-sm shadow-[#1B4965]/30'
          : 'bg-[#D4D0C8] dark:bg-[#3A3835]'
      }`}
    >
      <span
        className={`toggle-knob absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function SettingsSection({ isDarkMode, onToggleTheme, transactions = [], onClearAll, onImportTransactions, userEmail, onSignOut, billingCycleDay = 1, onBillingCycleDayChange, defaultPeriodFilter = 'month', onDefaultPeriodFilterChange, cards, onSaveCards, selectedMonth }) {
  const { t, lang } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showOpenFinance, setShowOpenFinance] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState(() => loadNotificationPrefs());
  const [notifPermission, setNotifPermission] = useState(() => getNotificationPermission());
  const premium = isPremium();

  // Sync permission state on mount
  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  const currentLangName = LANGUAGES[lang]?.name ?? lang;
  const currentLangFlag = LANGUAGES[lang]?.flag ?? '';

  // ── Notification handlers ───────────────────────────────────────────────

  const handleToggleNotifications = async () => {
    if (!notifPrefs.enabled) {
      // Enabling — request permission first
      const perm = await requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        const updated = { ...notifPrefs, enabled: true };
        setNotifPrefs(updated);
        saveNotificationPrefs(updated);
      }
    } else {
      // Disabling
      const updated = { ...notifPrefs, enabled: false };
      setNotifPrefs(updated);
      saveNotificationPrefs(updated);
    }
  };

  const handleToggleNotifPref = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    saveNotificationPrefs(updated);
  };

  // ── Export / Import handlers ────────────────────────────────────────────

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `syros-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert(t('settings.data.exportSuccess'));
    } catch {
      alert(t('settings.data.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const data = await exportAllData();
      const headers = ['Data', 'Descrição', 'Tipo', 'Valor', 'Pago', 'Método', 'Categoria', 'Recorrência'];
      const rows = data.transactions.map((tx) => [
        new Date(tx.createdAt).toLocaleDateString(lang),
        tx.description,
        tx.type === 'income' ? t('form.type.income') : t('form.type.expense'),
        Math.abs(tx.amount).toFixed(2),
        tx.paid ? 'Sim' : 'Não',
        tx.paymentMethod || '-',
        tx.category || '-',
        tx.recurrence || 'single',
      ]);
      const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `syros-transacoes-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert(t('settings.data.exportCsvSuccess'));
    } catch {
      alert(t('settings.data.exportCsvError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        const ok = await importAllData(data);
        if (ok) {
          alert(t('settings.data.importSuccess'));
          window.location.reload();
        } else {
          alert(t('settings.data.importFail'));
        }
      } catch {
        alert(t('settings.data.importError'));
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Page title */}
      <div className="px-1 pt-1">
        <h2 className="text-2xl font-bold font-display text-gradient tracking-tight">{t('settings.title')}</h2>
      </div>

      {/* Conta do usuario */}
      {userEmail && (
        <SettingsGroup title={t('settings.user.section') || 'Conta'}>
          <SettingsRow
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B4965] dark:text-[#5FA8D3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            iconBg="bg-[#E8F0F4] dark:bg-[#1B2B35]"
            label={userEmail}
            sublabel={t('settings.user.loggedIn') || 'Conectado'}
            chevron={false}
          />
          <SettingsRow
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#9B2226] dark:text-[#E76F51]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            }
            label={t('settings.signOut') || 'Sair da conta'}
            danger
            onClick={onSignOut}
            chevron={false}
          />
        </SettingsGroup>
      )}

      {/* Conta e Plano */}
      <SettingsGroup title={t('settings.account.section')}>
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          }
          iconBg="bg-amber-100 dark:bg-amber-900/40"
          label={t('settings.account.plan')}
          sublabel={premium ? t('settings.account.planPremium') : t('settings.account.planFree')}
          right={
            premium ? (
              <span className="text-xs font-semibold text-amber-500">{t('common.premium')}</span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1B4965] text-white font-semibold">{t('common.free')}</span>
            )
          }
          chevron={false}
        />
        {!premium && (
          <SettingsRow
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B4965] dark:text-[#5FA8D3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            iconBg="bg-[#E8F0F4] dark:bg-[#1B2B35]"
            label={t('settings.account.upgrade')}
            sublabel={`R$ ${SMARTFINANCE_CONFIG.pricing.monthly.toFixed(2)}${t('settings.account.upgradeDesc')}`}
            onClick={() => setShowPaywall(true)}
          />
        )}
      </SettingsGroup>

      {/* Aparencia */}
      <SettingsGroup title={t('settings.appearance.section')}>
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B4965] dark:text-[#5FA8D3]" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          }
          iconBg="bg-[#E8F0F4] dark:bg-[#1B2B35]"
          label={t('settings.appearance.darkMode')}
          sublabel={isDarkMode ? t('settings.appearance.darkOn') : t('settings.appearance.darkOff')}
          right={<Toggle checked={isDarkMode} onChange={onToggleTheme} />}
          chevron={false}
        />
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B4965] dark:text-[#5FA8D3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          }
          iconBg="bg-[#E8F0F4] dark:bg-[#1B2B35]"
          label={t('settings.appearance.language')}
          right={
            <span className="text-sm text-[#9B9B9B] dark:text-[#6B6560]">
              {currentLangFlag} {currentLangName}
            </span>
          }
          onClick={() => setShowLangPicker(true)}
        />
      </SettingsGroup>

      {/* Ciclo de faturamento */}
      <SettingsGroup title={t('settings.billingCycle.section')}>
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B4965] dark:text-[#5FA8D3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          iconBg="bg-[#E8F0F4] dark:bg-[#1B2B35]"
          label={t('settings.billingCycle.label')}
          sublabel={t('settings.billingCycle.desc')}
          chevron={false}
          right={
            <select
              value={billingCycleDay}
              onChange={(e) => onBillingCycleDayChange(e.target.value)}
              className="text-sm bg-[#F4F3EF] dark:bg-[#1A1918] text-[#1A1A1A] dark:text-[#E8E4DF] rounded-lg px-3 py-1.5 border-0 focus:ring-2 focus:ring-[#1B4965]"
            >
              <option value={1}>{t('settings.billingCycle.day1')}</option>
              {Array.from({ length: 28 }, (_, i) => i + 2).map((d) => (
                <option key={d} value={d}>{t('settings.billingCycle.dayN', { day: d })}</option>
              ))}
            </select>
          }
        />
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B4965] dark:text-[#5FA8D3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h6" />
            </svg>
          }
          iconBg="bg-[#E8F0F4] dark:bg-[#1B2B35]"
          label={t('settings.defaultPeriod.label')}
          sublabel={t('settings.defaultPeriod.desc')}
          chevron={false}
          right={
            <select
              value={defaultPeriodFilter}
              onChange={(e) => onDefaultPeriodFilterChange(e.target.value)}
              className="text-sm bg-[#F4F3EF] dark:bg-[#1A1918] text-[#1A1A1A] dark:text-[#E8E4DF] rounded-lg px-3 py-1.5 border-0 focus:ring-2 focus:ring-[#1B4965]"
            >
              <option value="month">{t('settings.defaultPeriod.month')}</option>
              <option value="cycle">{t('settings.defaultPeriod.cycle')}</option>
            </select>
          }
        />
      </SettingsGroup>

      {/* Integracoes */}
      <SettingsGroup title={t('settings.integrations.section')}>
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2D6A4F] dark:text-[#52B788]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
          iconBg="bg-[#E8F0F4] dark:bg-[#1B2B35]"
          label={t('settings.openfinance.title')}
          sublabel={t('settings.openfinance.desc')}
          onClick={() => setShowOpenFinance(!showOpenFinance)}
          right={
            showOpenFinance ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#9B9B9B]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            ) : undefined
          }
        />
      </SettingsGroup>

      {/* Open Finance expanded section */}
      {showOpenFinance && (
        <div className="px-1">
          <OpenFinanceSection
            existingTransactions={transactions}
            onImport={onImportTransactions}
          />
        </div>
      )}

      {/* Notificacoes */}
      <SettingsGroup title={t('settings.notifications.section')}>
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B4965] dark:text-[#5FA8D3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
          iconBg="bg-[#E8F0F4] dark:bg-[#1B2B35]"
          label={t('settings.notifications.enable')}
          sublabel={t('settings.notifications.enableDesc')}
          right={<Toggle checked={notifPrefs.enabled} onChange={handleToggleNotifications} />}
          chevron={false}
        />

        {/* Permission denied warning */}
        {notifPermission === 'denied' && (
          <div className="px-4 py-2.5">
            <p className="text-xs text-[#9B2226] dark:text-[#E76F51]">{t('settings.notifications.permissionDenied')}</p>
          </div>
        )}
        {notifPermission === 'unsupported' && (
          <div className="px-4 py-2.5">
            <p className="text-xs text-amber-500 dark:text-amber-400">{t('settings.notifications.notSupported')}</p>
          </div>
        )}

        {/* Sub-toggles (only when enabled) */}
        {notifPrefs.enabled && notifPermission === 'granted' && (
          <>
            <SettingsRow
              label={t('settings.notifications.upcomingBills')}
              sublabel={t('settings.notifications.upcomingBillsDesc')}
              right={<Toggle checked={notifPrefs.upcomingBills} onChange={() => handleToggleNotifPref('upcomingBills')} />}
              chevron={false}
            />
            <SettingsRow
              label={t('settings.notifications.budgetAlerts')}
              sublabel={t('settings.notifications.budgetAlertsDesc')}
              right={<Toggle checked={notifPrefs.budgetAlerts} onChange={() => handleToggleNotifPref('budgetAlerts')} />}
              chevron={false}
            />
            <SettingsRow
              label={t('settings.notifications.monthlyRecap')}
              sublabel={t('settings.notifications.monthlyRecapDesc')}
              right={<Toggle checked={notifPrefs.monthlyRecap} onChange={() => handleToggleNotifPref('monthlyRecap')} />}
              chevron={false}
            />
          </>
        )}
      </SettingsGroup>

      {/* Dados */}
      <SettingsGroup title={t('settings.data.section')}>
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B4965] dark:text-[#5FA8D3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          iconBg="bg-[#E8F0F4] dark:bg-[#1B2B35]"
          label={t('settings.data.exportJson')}
          sublabel={t('settings.data.exportJsonDesc')}
          onClick={isExporting ? undefined : handleExportJSON}
        />
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2D6A4F] dark:text-[#52B788]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
          iconBg="bg-[#E8F0F4] dark:bg-[#1B2B35]"
          label={t('settings.data.exportCsv')}
          sublabel={t('settings.data.exportCsvDesc')}
          onClick={isExporting ? undefined : handleExportCSV}
        />
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B4965] dark:text-[#5FA8D3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          }
          iconBg="bg-[#E8F0F4] dark:bg-[#1B2B35]"
          label={t('settings.data.import')}
          sublabel={t('settings.data.importDesc')}
          onClick={handleImport}
        />
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#9B2226] dark:text-[#E76F51]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
          label={t('settings.data.clearAll')}
          danger
          onClick={onClearAll}
          chevron={false}
        />
      </SettingsGroup>

      {/* Carteira */}
      <div className="space-y-1.5 card-animate">
        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-[#1B4965] dark:text-[#5FA8D3]">
          {t('page.wallet.overline')}
        </p>
        <CreditCardsSection
          transactions={transactions}
          cards={cards}
          onSaveCards={onSaveCards}
          selectedMonth={selectedMonth}
        />
        <ExportSection />
      </div>

      {/* Sobre */}
      <SettingsGroup title={t('settings.about.section')}>
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6B6B6B] dark:text-[#A09A92]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label={t('settings.about.version')}
          right={
            <span className="text-sm text-[#9B9B9B] dark:text-[#6B6560]">
              v{SMARTFINANCE_CONFIG.version}
            </span>
          }
          chevron={false}
        />
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B4965] dark:text-[#5FA8D3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
          iconBg="bg-[#E8F0F4] dark:bg-[#1B2B35]"
          label={t('settings.about.feedback')}
          sublabel={t('settings.about.feedbackDesc')}
          onClick={() => window.open('mailto:contactsyros@gmail.com')}
        />
        <SettingsRow
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6B6B6B] dark:text-[#A09A92]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
          label={t('settings.about.privacy')}
          onClick={() => setShowPrivacy(true)}
        />
      </SettingsGroup>

      {/* Language Picker Modal */}
      <LanguagePicker isOpen={showLangPicker} onClose={() => setShowLangPicker(false)} />
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </div>
  );
}
