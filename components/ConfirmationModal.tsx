import React, { useState, useEffect } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText?: string;
  cancelText?: string;
  children: React.ReactNode;
  confirmButtonClass?: string;
  loading?: boolean;
  disabled?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  children,
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  loading = false,
  disabled = false,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (loading) return;
    setIsClosing(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  const handleConfirmClick = () => {
    if (loading || disabled) return;
    onConfirm();
    // The modal will be closed by the parent component's state change
  };
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };


  if (!isOpen) {
    return null;
  }

  const modalContainerClass = `fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`;
  const modalContentClass = `bg-slate-50 dark:bg-slate-900 w-full max-w-md rounded-lg shadow-2xl flex flex-col ${isClosing ? 'animate-slide-down-and-fade' : 'animate-slide-up'}`;

  return (
    <div className={modalContainerClass} onClick={handleOverlayClick}>
      <div className={modalContentClass} onClick={(e) => e.stopPropagation()}>
        <header className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        </header>
        <main className="p-6 text-slate-600 dark:text-slate-300">
          {children}
        </main>
        <footer className="p-4 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={handleClose}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={loading || disabled}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-all flex items-center gap-2 ${confirmButtonClass} ${(loading || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {confirmText}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmationModal;