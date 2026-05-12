import React from 'react';
import Modal from './Modal.jsx';

function ConfirmDeleteModal({ isOpen, onCancel, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <svg className="h-7 w-7 text-[#9B2226] dark:text-[#E76F51]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#E8E4DF] mt-4">Apagar Tudo?</h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92] mt-2">
          Tem certeza que deseja apagar todas as transações? Esta ação não pode ser desfeita.
        </p>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-[#F4F3EF] dark:bg-[#2D2B28] text-[#1A1A1A] dark:text-[#E8E4DF] font-semibold py-3 px-4 rounded-xl hover:bg-[#E8E5E0] dark:hover:bg-[#3A3835] transition min-h-[44px] text-sm"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 bg-[#9B2226] text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#7F1D1F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9B2226] transition min-h-[44px] text-sm"
        >
          Sim, Apagar
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDeleteModal;
