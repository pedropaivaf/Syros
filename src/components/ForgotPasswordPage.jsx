import React, { useState } from 'react';
import { useTranslation } from '../i18n/index.jsx';
import { inputBaseAuth as inputBase, btnPrimary } from '../styles/shared.js';
import AuthLayout from './AuthLayout.jsx';

function ForgotPasswordPage({ onResetPassword, onSwitchToLogin }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await onResetPassword(email);
    setLoading(false);
    if (err) {
      setError(t('auth.error.resetFailed') || 'Erro ao enviar email de recuperacao. Tente novamente.');
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <AuthLayout className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#E8F0F4] dark:bg-[#1B2B35] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1B4965] dark:text-[#5FA8D3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold font-display text-[#1A1A1A] dark:text-[#E8E4DF]">
          {t('auth.reset.successTitle') || 'Email enviado!'}
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92]">
          {t('auth.reset.successMessage') || 'Verifique sua caixa de entrada (e spam) para o link de recuperacao de senha.'}
        </p>
        <button type="button" onClick={onSwitchToLogin} className={btnPrimary}>
          {t('auth.reset.backToLogin') || 'Voltar ao login'}
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.reset.title') || 'Recuperar senha'} subtitle={t('auth.reset.subtitle') || 'Digite seu email para receber o link de recuperacao'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-[#9B2226] dark:text-[#E76F51] text-sm text-center">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="reset-email" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1 block">
            {t('auth.email') || 'Email'}
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={inputBase}
            required
            autoComplete="email"
          />
        </div>

        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? (t('auth.loading') || 'Enviando...') : (t('auth.reset.button') || 'Enviar link de recuperacao')}
        </button>
      </form>

      <p className="text-center text-sm text-[#6B6B6B] dark:text-[#A09A92]">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-[#1B4965] hover:text-[#153B52] dark:text-[#5FA8D3] dark:hover:text-[#4A93BD] transition"
        >
          {t('auth.reset.backToLogin') || 'Voltar ao login'}
        </button>
      </p>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
