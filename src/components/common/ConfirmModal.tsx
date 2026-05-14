import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl w-full max-w-sm"
        style={{ boxShadow: '0px 12px 32px rgba(0,0,0,0.20)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e1e3e4]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: danger ? 'rgba(186,26,26,0.1)' : 'rgba(255,202,40,0.15)' }}
            >
              <AlertTriangle
                size={16}
                style={{ color: danger ? '#ba1a1a' : '#e6a817' }}
              />
            </div>
            <h2
              className="font-bold text-base text-[#191c1d]"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74777d] hover:bg-[#f3f4f5] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-[#44474c]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#e1e3e4] bg-[#f8f9fa] rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm font-semibold rounded border border-[#74777d] text-[#1a2b3c] hover:bg-[#edeeef] transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-sm font-semibold rounded text-white transition-colors"
            style={{
              backgroundColor: danger ? '#ba1a1a' : '#00796b',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
