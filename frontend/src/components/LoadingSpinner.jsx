import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ className = '', size = 8 }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`w-${size} h-${size} animate-spin text-makka-brown`} />
    </div>
  );
}
