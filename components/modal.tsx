"use client";

import { FC, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

const Modal: FC<ModalProps> = ({ children, onClose }) => {
  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl focus:outline-none"
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
