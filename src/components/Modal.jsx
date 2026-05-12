import React from 'react';

function Modal({ isOpen, onClose, children, cardClassName }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="modal-overlay fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={cardClassName || 'modal-container animate-slide-up w-full sm:max-w-sm bg-white dark:bg-[#1E1D1C] rounded-t-2xl sm:rounded-2xl shadow-xl p-6'}>
        {children}
      </div>
    </div>
  );
}

export default Modal;
