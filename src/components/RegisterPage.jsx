import React, { useState } from 'react';
import { useTranslation } from '../i18n/index.jsx';
import PrivacyPolicyModal from './PrivacyPolicyModal.jsx';
import { inputBaseAuth as inputBase, btnPrimary } from '../styles/shared.js';
import AuthLayout from './AuthLayout.jsx';

function RegisterPage({ onSignUp, onSwitchToLogin }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.error.passwordMismatch') || 'As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError(t('auth.error.passwordTooShort') || 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (!lgpdConsent) {
      setError(t('auth.error.lgpdRequired') || 'Você precisa aceitar os termos para continuar.');
      return;
    }

    setLoading(true);
    const { error: err } = await onSignUp(email, password);
    setLoading(false);

    if (err) {
      if (err.message?.includes('already registered')) {
        setError(t('auth.error.alreadyRegistered') || 'Este email já está cadastrado.');
      } else {
        setError(err.message || (t('auth.error.generic') || 'Erro ao criar conta.'));
      }
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <AuthLayout className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2D6A4F] dark:text-[#52B788]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold font-display text-[#1A1A1A] dark:text-[#E8E4DF]">
          {t('auth.register.successTitle') || 'Conta criada!'}
        </h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92]">
          {t('auth.register.successMessage') || 'Verifique seu email para confirmar o cadastro, ou faça login diretamente.'}
        </p>
        <button type="button" onClick={onSwitchToLogin} className={btnPrimary}>
          {t('auth.register.goToLogin') || 'Ir para o login'}
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('app.name')} subtitle={t('auth.register.subtitle') || 'Crie sua conta gratuita'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-[#9B2226] dark:text-[#E76F51] text-sm text-center">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="register-email" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1 block">
            {t('auth.email') || 'Email'}
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={inputBase}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="register-password" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1 block">
            {t('auth.password') || 'Senha'}
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 caracteres"
              className={`${inputBase} pr-12`}
              required
              autoComplete="new-password"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9B9B9B] hover:text-[#6B6B6B] dark:hover:text-[#A09A92] transition"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="register-confirm-password" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1 block">
            {t('auth.confirmPassword') || 'Confirmar senha'}
          </label>
          <div className="relative">
            <input
              id="register-confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              className={`${inputBase} pr-12`}
              required
              autoComplete="new-password"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9B9B9B] hover:text-[#6B6B6B] dark:hover:text-[#A09A92] transition"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={lgpdConsent}
            onChange={(e) => setLgpdConsent(e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded border-[#D4D0C8] dark:border-[#3A3835] text-[#1B4965] focus:ring-[#1B4965] cursor-pointer flex-shrink-0"
          />
          <span className="text-xs text-[#6B6B6B] dark:text-[#A09A92] leading-relaxed">
            {t('auth.register.lgpdPrefix') || 'Concordo com os '}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}
              className="text-[#1B4965] dark:text-[#5FA8D3] font-semibold underline underline-offset-2"
            >
              {t('auth.register.lgpdTermsLink') || 'Termos de Uso e Política de Privacidade'}
            </button>
            {t('auth.register.lgpdSuffix') || '. Seus dados são protegidos conforme a LGPD.'}
          </span>
        </label>

        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? (t('auth.loading') || 'Criando...') : (t('auth.register.button') || 'Criar conta')}
        </button>
      </form>

      <p className="text-center text-sm text-[#6B6B6B] dark:text-[#A09A92]">
        {t('auth.register.hasAccount') || 'Já tem uma conta?'}{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-[#1B4965] hover:text-[#153B52] dark:text-[#5FA8D3] dark:hover:text-[#4A93BD] transition"
        >
          {t('auth.register.goToLogin') || 'Fazer login'}
        </button>
      </p>
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </AuthLayout>
  );
}

export default RegisterPage;
