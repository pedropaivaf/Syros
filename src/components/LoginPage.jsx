import React, { useState } from 'react';
import { useTranslation } from '../i18n/index.jsx';
import PrivacyPolicyModal from './PrivacyPolicyModal.jsx';
import { inputBaseAuth as inputBase, btnPrimary } from '../styles/shared.js';
import AuthLayout from './AuthLayout.jsx';

function LoginPage({ onSignIn, onSwitchToRegister, onSwitchToForgotPassword }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await onSignIn(email, password);
    setLoading(false);
    if (err) {
      setError(t('auth.error.invalidCredentials') || 'Email ou senha incorretos.');
    }
  };

  return (
    <AuthLayout title={t('app.name')} subtitle={t('auth.login.subtitle') || 'Entre para acessar suas finanças'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-[#9B2226] dark:text-[#E76F51] text-sm text-center">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1 block">
            {t('auth.email') || 'Email'}
          </label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1 block">
            {t('auth.password') || 'Senha'}
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className={`${inputBase} pr-12`}
              required
              autoComplete="current-password"
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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-[#D4D0C8] dark:border-[#3A3835] text-[#1B4965] focus:ring-[#1B4965] cursor-pointer"
            />
            <span className="text-sm text-[#6B6B6B] dark:text-[#A09A92]">
              {t('auth.login.rememberMe') || 'Lembrar de mim'}
            </span>
          </label>
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-sm font-medium text-[#1B4965] hover:text-[#153B52] dark:text-[#5FA8D3] dark:hover:text-[#4A93BD] transition"
          >
            {t('auth.login.forgotPassword') || 'Esqueci minha senha'}
          </button>
        </div>

        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? (t('auth.loading') || 'Entrando...') : (t('auth.login.button') || 'Entrar')}
        </button>
      </form>

      <p className="text-center text-sm text-[#6B6B6B] dark:text-[#A09A92]">
        {t('auth.login.noAccount') || 'Não tem uma conta?'}{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-[#1B4965] hover:text-[#153B52] dark:text-[#5FA8D3] dark:hover:text-[#4A93BD] transition"
        >
          {t('auth.login.createAccount') || 'Criar conta'}
        </button>
      </p>
      <p className="text-center">
        <button
          type="button"
          onClick={() => setShowPrivacy(true)}
          className="text-xs text-[#9B9B9B] dark:text-[#6B6560] underline underline-offset-2 hover:text-[#1B4965] dark:hover:text-[#5FA8D3] transition"
        >
          {t('settings.about.privacy')}
        </button>
      </p>
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </AuthLayout>
  );
}

export default LoginPage;
