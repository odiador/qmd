import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  side?: boolean; // Nuevo: si es true, el modal es tipo drawer a la derecha
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', side = false }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.addEventListener('mousedown', handleClickOutside);
      // Previene el scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-[1000] overflow-y-auto flex ${side ? 'items-start justify-end' : 'items-center justify-center'}`}>
          {/* Overlay de fondo */}
          {side ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-none"
              style={{ width: '100vw', height: '100vh', right: 'auto', left: 0, top: 0, bottom: 0, maxWidth: 'calc(100vw - 420px)' }}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
          )}
          {/* Contenido del modal */}
          <motion.div
            ref={modalRef}
            initial={side ? { opacity: 0, x: 400 } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={side ? { opacity: 1, x: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={side ? { opacity: 0, x: 400 } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={`bg-white rounded-lg shadow-xl z-[1001] w-full mx-4 ${side ? 'max-w-xl h-full fixed right-0 top-0 bottom-0 rounded-none' : sizeClasses[size]} overflow-hidden`}
            style={side ? { height: '100vh', maxWidth: 420 } : {}}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
