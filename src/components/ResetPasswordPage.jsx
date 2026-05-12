import React, { useState } from 'react';
import { useTranslation } from '../i18n/index.jsx';
import { SyrosLogo } from './Header.jsx';

const inputBase =
  'w-full block text-sm px-4 py-3.5 rounded-xl border border-[#E8E5E0] dark:border-[#2D2B28] ' +
  'bg-white dark:bg-[#1E1D1C] text-[#1A1A1A] dark:text-[#E8E4DF] ' +
  'placeholder:text-[#9B9B9B] dark:placeholder:text-[#6B6560] focus:outline-none focus:ring-2 ' +
  'focus:ring-[#1B4965] focus:border-[#1B4965] transition leading-tight';

function ResetPasswordPage({ onUpdatePassword, onDone }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError(t('auth.error.passwordTooShort') || 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError(t('auth.error.passwordMismatch') || 'As senhas não coincidem.');
      return;
    }
    setLoading(true);
    const { error: err } = await onUpdatePassword(password);
    setLoading(false);
    if (err) {
      setError(t('auth.error.updateFailed') || 'Erro ao atualizar senha. Tente novamente.');
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#FAFAF8] dark:bg-[#111110]">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#E8F4EC] dark:bg-[#1B2E22] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2D6A4F] dark:text-[#52B788]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold font-display text-[#1A1A1A] dark:text-[#E8E4DF]">
            {t('auth.reset.updateSuccess') || 'Senha atualizada!'}
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92]">
            {t('auth.reset.updateSuccessMessage') || 'Sua senha foi alterada com sucesso.'}
          </p>
          <button
            type="button"
            onClick={onDone}
            className="w-full bg-[#1B4965] hover:bg-[#153B52] text-white font-semibold py-3.5 px-4 rounded-xl transition duration-300 shadow-md"
          >
            {t('auth.reset.goToApp') || 'Ir para o app'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FAFAF8] dark:bg-[#111110]">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16"><SyrosLogo className="h-16 w-16" /></div>
          <h1 className="text-2xl font-bold font-display text-[#1A1A1A] dark:text-[#E8E4DF]">
            {t('auth.reset.newPasswordTitle') || 'Nova senha'}
          </h1>
          <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A09A92]">
            {t('auth.reset.newPasswordSubtitle') || 'Escolha uma senha nova para sua conta.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-[#9B2226] dark:text-[#E76F51] text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="new-password" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1 block">
              {t('auth.reset.newPassword') || 'Nova senha'}
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mínimo 6 caracteres"
                className={`${inputBase} pr-12`}
                required
                minLength={6}
                autoComplete="new-password"
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
            <label htmlFor="confirm-password" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1 block">
              {t('auth.reset.confirmNewPassword') || 'Confirmar nova senha'}
            </label>
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="repita a senha"
              className={inputBase}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1B4965] hover:bg-[#153B52] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl transition duration-300 shadow-md"
          >
            {loading ? (t('auth.loading') || 'Salvando...') : (t('auth.reset.updateButton') || 'Salvar nova senha')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
