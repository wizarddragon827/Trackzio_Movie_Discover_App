import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

export default function Toast() {
  const { toast } = useWishlist();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#10b981" />,
    error: <AlertCircle size={18} color="#f43f5e" />,
    info: <Info size={18} color="#f59e0b" />,
  };

  return (
    <div className="toast-container">
      <div className={`toast-bubble ${toast.type || 'info'}`}>
        {icons[toast.type] || icons.info}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
