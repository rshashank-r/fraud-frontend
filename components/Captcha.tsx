import React, { useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface CaptchaProps {
  onVerify: (token: string | null) => void;
  onError?: () => void;
}

export const Captcha: React.FC<CaptchaProps> = ({ onVerify, onError }) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = (token: string | null) => {
    onVerify(token);
  };

  const handleExpired = () => {
    console.warn('⚠️ CAPTCHA expired');
    onVerify(null);
  };

  const handleError = () => {
    console.error('❌ CAPTCHA error');
    if (onError) onError();
  };

  return (
    <div className="flex justify-center my-4">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Google's test key - replace with your own
        onChange={handleChange}
        onExpired={handleExpired}
        onErrored={handleError}
        theme="dark"
        size="normal"
      />
    </div>
  );
};

export default Captcha;
