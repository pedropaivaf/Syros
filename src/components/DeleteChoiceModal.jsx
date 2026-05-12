import React from 'react';
import Modal from './Modal.jsx';

function DeleteChoiceModal({ isOpen, onClose, onDeleteSingle, onDeleteAll }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <svg className="h-7 w-7 text-[#9B2226] dark:text-[#E76F51]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#E8E4DF] mt-4">Excluir Parcela</h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92] mt-2">
          Você está excluindo uma transação parcelada. O que deseja fazer?
        </p>
      </div>
      <div className="flex flex-col gap-2.5 mt-6">
        <button
          type="button"
          onClick={onDeleteAll}
          className="w-full bg-[#9B2226] text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#7F1D1F] transition min-h-[44px] text-sm"
        >
          Excluir Todas as Parcelas
        </button>
        <button
          type="button"
          onClick={onDeleteSingle}
          className="w-full bg-[#9B2226]/10 dark:bg-[#E76F51]/15 text-[#9B2226] dark:text-[#E76F51] font-semibold py-3 px-4 rounded-xl hover:bg-[#9B2226]/20 dark:hover:bg-[#E76F51]/25 transition min-h-[44px] text-sm"
        >
          Excluir Apenas Esta Parcela
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full text-center font-semibold text-[#6B6B6B] dark:text-[#A09A92] py-3 min-h-[44px] text-sm"
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}

export default DeleteChoiceModal;
