import React, { useState, useEffect } from 'react';
import { RefreshCw, Shield, Loader2, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';

interface CaptchaProps {
  onVerify: (challengeId: string, answer: number) => void;
  onError?: () => void;
}

export const Captcha: React.FC<CaptchaProps> = ({ onVerify, onError }) => {
  const [challenge, setChallenge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showHint, setShowHint] = useState(false); // IMPROVED: Hide answer by default

  // Fetch challenge on mount
  useEffect(() => {
    fetchChallenge();
  }, []);

  const fetchChallenge = async () => {
    setIsLoading(true);
    setIsVerified(false);
    setAnswer('');
    setShowHint(false); // Hide hint for new challenge
    try {
      const data = await authAPI.getCaptchaChallenge();
      setChallenge(data);
    } catch (error) {
      console.error('Failed to load CAPTCHA:', error);
      if (onError) onError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setAnswer(value);

      // Clear verified state when user changes answer
      if (isVerified) {
        setIsVerified(false);
      }

      // DO NOT auto-verify - wait for Enter key or blur
    }
  };

  const verifyAnswer = () => {
    if (answer && challenge && !isVerified) {
      const numAnswer = parseInt(answer, 10);
      if (!isNaN(numAnswer)) {
        onVerify(challenge.challenge_id, numAnswer);
        setIsVerified(true);
      }
    }
  };

  const handleAnswerBlur = () => {
    // Verify when user finishes typing (leaves input)
    verifyAnswer();
  };

  const handleAnswerKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Verify on Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      verifyAnswer();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6 bg-slate-800 rounded-xl border border-slate-700">
        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin mr-2" />
        <span className="text-gray-400 text-sm">Loading verification...</span>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
        <p className="text-sm text-red-400">Failed to load verification. Please refresh.</p>
        <button
          onClick={fetchChallenge}
          className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Human Verification
      </label>

      <div className={`p-4 rounded-xl border transition-all ${isVerified
        ? 'bg-green-500/10 border-green-500/50'
        : 'bg-slate-800 border-slate-700'
        }`}>
        {/* Challenge Question */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${isVerified ? 'text-green-400' : 'text-cyan-400'}`} />
            <span className="text-sm font-medium text-gray-300">
              {challenge.question}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Info Icon - Shows Hint */}
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className={`p-1.5 rounded-lg transition-colors ${showHint ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-700 text-gray-400 hover:text-cyan-400'
                }`}
              title={showHint ? "Hide answer" : "Show answer hint"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <circle cx="12" cy="8" r="0.5" fill="currentColor" />
              </svg>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchChallenge}
              className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
              title="Get new challenge"
            >
              <RefreshCw className="w-4 h-4 text-gray-400 hover:text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Hint Text - Only shown when info icon is clicked */}
        {showHint && challenge.correct_answer && (
          <div className="mb-3 p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <p className="text-xs text-cyan-400 text-center">
              💡 Answer: <span className="font-semibold">{challenge.correct_answer}</span>
            </p>
          </div>
        )}

        {/* Answer Input */}
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={answer}
            onChange={handleAnswerChange}
            onBlur={handleAnswerBlur}
            onKeyPress={handleAnswerKeyPress}
            placeholder="Your answer"
            className={`w-full px-4 py-3 rounded-lg text-center text-lg font-semibold transition-all ${isVerified
              ? 'bg-green-500/10 border-2 border-green-500/50 text-green-400'
              : 'bg-slate-900 border-2 border-slate-700 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
              } outline-none`}
            maxLength={4}
          />

          {/* Verified Indicator */}
          {isVerified && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          )}
        </div>

        {/* Status Text */}
        <p className={`mt-2 text-xs text-center transition-all ${isVerified ? 'text-green-400' : 'text-gray-500'
          }`}>
          {isVerified ? '✓ Verified - Press Enter to confirm' : 'Type answer and press Enter or click outside'}
        </p>
      </div>
    </div>
  );
};

export default Captcha;
