import React, { useState } from 'react';
import { CheckCircle, Shield, Loader2 } from 'lucide-react';

interface CaptchaProps {
  onVerify: (token: string | null) => void;
  onError?: () => void;
}

export const Captcha: React.FC<CaptchaProps> = ({ onVerify }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async (e: React.MouseEvent) => {
    // Basic Bot Protection: Ensure it's a trusted event (real user click)
    if (!e.isTrusted) return;

    setIsVerifying(true);

    // Simulate network delay for better UX
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      // Generate a dummy token that the backend will accept as proof
      onVerify(`human_token_${Date.now()}_${Math.random().toString(36).substr(2)}`);
    }, 800);
  };

  return (
    <div className="flex justify-center my-4">
      <div
        onClick={!isVerified ? handleVerify : undefined}
        className={`relative flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer w-full max-w-[300px] select-none ${isVerified
            ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : 'bg-slate-800 border-slate-600 hover:border-cyan-500/50 hover:bg-slate-800/80 hover:shadow-lg'
          }`}
      >
        <div className="flex items-center gap-3">
          {/* Checkbox Box */}
          <div className={`w-6 h-6 rounded flex items-center justify-center border transition-all ${isVerified ? 'bg-green-500 border-green-500' : 'bg-slate-700 border-gray-500'
            }`}>
            {isVerifying ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : isVerified ? (
              <CheckCircle className="w-4 h-4 text-white" />
            ) : (
              <div className="w-4 h-4" /> // Empty placeholder
            )}
          </div>

          <span className={`font-medium ${isVerified ? 'text-green-400' : 'text-gray-300'}`}>
            {isVerified ? 'Verified Human' : 'I am human'}
          </span>
        </div>

        <div className="flex flex-col items-end opacity-50">
          <Shield className="w-5 h-5 text-cyan-400 mb-0.5" />
          <span className="text-[10px] text-gray-500 leading-none">SecureCheck</span>
        </div>

        {/* Shine Effect */}
        {!isVerified && (
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-[shimmer_2s_infinite]"></div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          100% { left: 200%; }
        }
      `}</style>
    </div>
  );
};

export default Captcha;
