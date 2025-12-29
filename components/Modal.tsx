import React, { useEffect } from 'react';

interface ModalProps {
  visible: boolean;
  onRequestClose?: () => void;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onRequestClose,
  children,
  animationType = 'fade',
  transparent = true,
}) => {
  useEffect(() => {
    // Prevent body scroll when modal is open
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  useEffect(() => {
    // Handle ESC key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible && onRequestClose) {
        onRequestClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onRequestClose]);

  if (!visible) return null;

  const animationClass =
    animationType === 'slide'
      ? 'animate-slide-up'
      : animationType === 'fade'
      ? 'animate-fade-in'
      : '';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        transparent ? 'bg-black bg-opacity-60' : 'bg-black'
      } ${animationClass}`}
      onClick={onRequestClose}
      role="dialog"
      aria-modal="true"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className={`relative max-h-[90vh] max-w-[90vw] overflow-auto ${animationClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;

