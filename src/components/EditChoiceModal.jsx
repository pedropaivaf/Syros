import React from 'react';
import Modal from './Modal.jsx';

function EditChoiceModal({ isOpen, onClose, onEditSingle, onEditAll }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#E8F0F4] dark:bg-[#1B2B35] flex items-center justify-center">
          <svg className="h-7 w-7 text-[#1B4965] dark:text-[#5FA8D3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#E8E4DF] mt-4">Editar Parcela</h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92] mt-2">
          Você está editando uma transação parcelada. O que deseja fazer?
        </p>
      </div>
      <div className="flex flex-col gap-2.5 mt-6">
        <button
          type="button"
          onClick={onEditAll}
          className="w-full text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#153B52] transition min-h-[44px] text-sm"
          style={{ background: 'var(--accent)' }}
        >
          Alterar Valor das Futuras
        </button>
        <button
          type="button"
          onClick={onEditSingle}
          className="w-full bg-[#E8F0F4] dark:bg-[#1B2B35] text-[#1B4965] dark:text-[#5FA8D3] font-semibold py-3 px-4 rounded-xl hover:bg-[#D4E6ED] dark:hover:bg-[#243845] transition min-h-[44px] text-sm"
        >
          Editar Apenas Esta Parcela
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

export default EditChoiceModal;
