import { X } from "lucide-react";
import { useEffect } from "react";

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const AnimatedModal = ({ isOpen, onClose, children, title }: AnimatedModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto
                   bg-zinc-900 rounded-2xl border border-white/10
                   shadow-2xl shadow-cyan-500/20 animate-slide-up-bounce p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white
                     transition-colors p-2 hover:bg-white/10 rounded-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Title */}
        {title && (
          <h2 id="modal-title" className="text-2xl font-bold mb-6 pr-8">
            {title}
          </h2>
        )}
        
        {/* Content */}
        <div className="stagger-children">
          {children}
        </div>
      </div>
    </div>
  );
};
