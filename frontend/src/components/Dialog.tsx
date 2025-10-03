import React from 'react';

export type DialogType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface DialogProps {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const iconConfig = {
  success: { emoji: '✅', bgColor: 'bg-green-100', textColor: 'text-green-600' },
  error: { emoji: '❌', bgColor: 'bg-red-100', textColor: 'text-red-600' },
  warning: { emoji: '⚠️', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
  info: { emoji: 'ℹ️', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
  confirm: { emoji: '❓', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
};

const buttonConfig = {
  success: 'bg-green-600 hover:bg-green-700',
  error: 'bg-red-600 hover:bg-red-700',
  warning: 'bg-yellow-600 hover:bg-yellow-700',
  info: 'bg-blue-600 hover:bg-blue-700',
  confirm: 'bg-blue-600 hover:bg-blue-700',
};

export default function Dialog({
  isOpen,
  type,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
}: DialogProps) {
  if (!isOpen) return null;

  const config = iconConfig[type];
  const buttonColor = buttonConfig[type];
  const isConfirmDialog = type === 'confirm' || !!onConfirm;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
            <span className="text-2xl">{config.emoji}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-700 whitespace-pre-line">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          {isConfirmDialog && (
            <button
              onClick={onClose}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm || onClose}
            className={`px-4 py-2 ${buttonColor} text-white rounded-lg font-semibold transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for easy dialog usage
export function useDialog() {
  const [dialogState, setDialogState] = React.useState<{
    isOpen: boolean;
    type: DialogType;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showDialog = (
    type: DialogType,
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setDialogState({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
    closeDialog();
  };

  return {
    dialogState,
    showDialog,
    closeDialog,
    handleConfirm,
    // Convenience methods
    showSuccess: (title: string, message: string) => showDialog('success', title, message),
    showError: (title: string, message: string) => showDialog('error', title, message),
    showWarning: (title: string, message: string) => showDialog('warning', title, message),
    showInfo: (title: string, message: string) => showDialog('info', title, message),
    showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) =>
      showDialog('confirm', title, message, onConfirm, confirmText, cancelText),
  };
}
