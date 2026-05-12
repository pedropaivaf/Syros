import React from 'react';
import { SyrosLogo } from './Header.jsx';

function AuthLayout({ title, subtitle, className = 'space-y-8', children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FAFAF8] dark:bg-[#111110]">
      <div className={`w-full max-w-sm ${className}`}>
        {title && (
          <div className="text-center">
            <div className="mx-auto mb-4 w-16">
              <SyrosLogo className="h-16 w-16" />
            </div>
            <h1 className="text-2xl font-bold font-display text-[#1A1A1A] dark:text-[#E8E4DF]">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-[#6B6B6B] dark:text-[#A09A92]">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
