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
      className={`fixed inset-0 z-50 flex items-center justify-center ${animationClass}`}
      style={{
        background: transparent 
          ? 'rgba(0, 0, 0, 0.5)' 
          : 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      onClick={onRequestClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative max-h-[90vh] max-w-[90vw] overflow-auto ${animationClass}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.3))',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
