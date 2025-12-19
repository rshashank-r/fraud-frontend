import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle,
  Smartphone, Loader2, ArrowLeft, RefreshCw, KeyRound
} from 'lucide-react';
import { Button } from '../components/ui';
import Captcha from '../components/Captcha';
import { authAPI } from '../services/api';
import { getEnhancedFingerprint } from '../utils/securityUtils';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();
  const userRole = role || localStorage.getItem('role');

  // ✅ AUTO-REDIRECT if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole) {
      console.log('🔄 User already authenticated, redirecting from Auth...');
      const redirectPath = userRole === 'ADMIN' ? '/admin' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);


  // Tab State
  const [isLogin, setIsLogin] = useState(true);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registerAsAdmin, setRegisterAsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');

  // CAPTCHA State (server-side challenge)
  const [captchaChallengeId, setCaptchaChallengeId] = useState<string | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState<number | null>(null);

  // Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score === 2) return 'bg-yellow-500';
    if (score === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // 2FA/OTP States
  const [verificationRequired, setVerificationRequired] = useState<'totp' | 'email_otp' | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OTP Timer Countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // ==========================================
  // STEP 1: INITIAL LOGIN/REGISTER
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // ✅ LOGIN - Step 1 with Enhanced Security Fingerprinting
        if (!captchaChallengeId || captchaAnswer === null) {
          setError('Please complete the verification challenge');
          setLoading(false);
          return;
        }

        // Collect enhanced device fingerprint with security checks
        const fingerprint = await getEnhancedFingerprint();

        // Send login request with security data
        const response = await authAPI.login(
          email,
          password,
          captchaChallengeId,
          captchaAnswer,
          undefined, // lat
          undefined, // lon
          {
            // Pass security flags to backend via fingerprint
            is_webdriver: fingerprint.developer_tools_enabled,
            is_emulator: fingerprint.is_emulator,
            is_rooted: fingerprint.is_rooted,
            ...fingerprint
          }
        );

        // Check if verification is required (202 status)
        if (response.verification_required) {
          setVerificationRequired(response.verification_required);
          setOtpTimer(300); // 5 minutes

          if (response.verification_required === 'totp') {
            setSuccess('Enter your 6-digit authenticator code');
          } else if (response.verification_required === 'email_otp') {
            setSuccess('OTP sent to your email. Check your inbox.');
          }
        } else {
          // Direct login without 2FA
          console.log('Login response:', response);
          console.log('Token:', response.access_token || response.token);
          console.log('Role:', response.role);

          if (response.access_token || response.token) {
            const token = response.access_token || response.token;
            const userRole = response.role;

            console.log('Calling login() with token:', token, 'role:', userRole);
            login(token, userRole);

            // Verify localStorage
            console.log('Token in localStorage:', localStorage.getItem('token'));
            console.log('Role in localStorage:', localStorage.getItem('role'));

            setSuccess('Login successful!');

            const redirectPath = userRole === 'ADMIN' ? '/admin' : '/dashboard';
            console.log('Redirecting to:', redirectPath);

            setTimeout(() => {
              navigate(redirectPath, { replace: true });
            }, 1000);
          } else {
            console.error('No token in response!', response);
            setError('Login failed: No authentication token received');
          }
        }
      } else {
        // ✅ REGISTER
        if (!captchaChallengeId || captchaAnswer === null) {
          setError('Please complete the verification challenge');
          setLoading(false);
          return;
        }
        const response = await authAPI.register(
          email,
          password,
          phoneNumber,
          registerAsAdmin ? adminKey : undefined,
          captchaChallengeId,
          captchaAnswer
        );
        setSuccess(response.message || 'Registration successful! Please login.');

        // Switch to login after 2 seconds
        setTimeout(() => {
          setIsLogin(true);
          setPassword('');
        }, 2000);
      }
    } catch (err: any) {
      console.error('=== AUTH ERROR DEBUG ===');
      console.error('Full error:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', JSON.stringify(err.response?.data, null, 2));
      console.error('Response headers:', err.response?.headers);

      // Handle specific security blocks with clear messages
      const responseData = err.response?.data || {};
      const errorMessage = responseData.error || err.message || 'Authentication failed. Please try again.';
      const backendMessage = responseData.message || '';
      const riskFactors = responseData.risk_factors || [];

      console.log('Extracted error message:', errorMessage);
      console.log('Extracted backend message:', backendMessage);
      console.log('Extracted risk factors:', riskFactors);

      // Check for security-related denials
      if (errorMessage.includes('suspicious device') ||
        errorMessage.includes('Login denied') ||
        backendMessage.includes('suspicious device') ||
        backendMessage.includes('Developer Tools') ||
        backendMessage.includes('Emulator') ||
        backendMessage.includes('Rooted')) {

        // Security-based login denial (not account freeze)
        if (riskFactors.some((f: string) => f.includes('Developer tools')) ||
          backendMessage.includes('Developer Tools')) {
          setError('🚫 Access denied: Developer tools detected. Please close DevTools and login again.');
        } else if (riskFactors.some((f: string) => f.includes('Emulator')) ||
          backendMessage.includes('Emulator')) {
          setError('🚫 Access denied: Automated browser detected. Please use a real device to login.');
        } else if (riskFactors.some((f: string) => f.includes('Rooted') || f.includes('jailbroken')) ||
          backendMessage.includes('Rooted')) {
          setError('🚫 Access denied: Rooted device detected. Please use a secure device to login.');
        } else {
          // Show backend message or risk factors
          setError(backendMessage || `🚫 Access denied from suspicious device. ${riskFactors.join(', ')}`);
        }
      } else if (errorMessage.includes('frozen') || errorMessage.includes('Account frozen')) {
        // Actual account freeze (different from device-based denial)
        setError(`🚫 Account frozen due to security concerns. Please contact support.`);
      } else {
        // Show the most specific message available
        setError(backendMessage || errorMessage);
      }

      console.error('Final error shown to user:', backendMessage || errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STEP 2: VERIFY 2FA/OTP
  // ==========================================
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let response;

      if (verificationRequired === 'totp') {
        // ✅ TOTP Verification (Google Authenticator)
        response = await authAPI.verify2FA(email, verificationCode);
      } else if (verificationRequired === 'email_otp') {
        // ✅ Email OTP Verification
        response = await authAPI.verifyEmailOTP(email, verificationCode);
      }

      // ✅ Success - Token saved in authAPI methods
      setSuccess('Verification successful! Redirecting...');

      if (response && (response.access_token || response.token)) {
        const token = response.access_token || response.token;
        const role = response.role;

        console.log('✅ OTP Verification Success. Syncing state and redirecting...');

        // Use the login function to sync context and localStorage
        login(token, role);

        // Immediate navigation
        const redirectPath = role === 'ADMIN' ? '/admin' : '/dashboard';
        navigate(redirectPath, { replace: true });
      } else {
        setError('Verification successful, but session could not be established. Please login again.');
      }


    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.response?.data?.error || 'Invalid verification code. Please try again.');
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESEND OTP
  // ==========================================
  const handleResendOTP = async () => {
    if (otpTimer > 0) return;

    setLoading(true);
    setError('');

    try {
      await authAPI.resendOTP(email);
      setSuccess('New OTP sent to your email!');
      setOtpTimer(300); // Reset timer to 5 minutes
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // BACK TO LOGIN
  // ==========================================
  const handleBackToLogin = () => {
    setVerificationRequired(null);
    setVerificationCode('');
    setOtpTimer(0);
    setError('');
    setSuccess('');
  };

  // ==========================================
  // RENDER: VERIFICATION SCREEN
  // ==========================================
  if (verificationRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
        </div>

        <div className="relative w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900/80 border border-cyan-500/30 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-bold text-white">SecureBank</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Verification Required</h2>
            <p className="text-gray-400">
              {verificationRequired === 'totp'
                ? 'Enter your authenticator code'
                : 'Enter the OTP sent to your email'}
            </p>
          </div>

          {/* Verification Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
            {/* Alert Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-400">{success}</p>
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleVerification} className="space-y-6">
              {/* Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {verificationRequired === 'totp' ? 'Authenticator Code' : 'Email OTP'}
                </label>
                <div className="relative">
                  {verificationRequired === 'totp' ? (
                    <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  ) : (
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  )}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-12 pr-4 py-5 bg-slate-800 border-2 border-slate-700 rounded-xl text-white text-center text-3xl tracking-widest font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/30 transition-all touch-manipulation"
                    style={{ fontSize: '28px', letterSpacing: '0.5em' }}
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                    autoComplete="one-time-code"
                  />
                </div>

                {/* Timer */}
                {verificationRequired === 'email_otp' && otpTimer > 0 && (
                  <p className="mt-2 text-xs text-gray-400 text-center">
                    OTP expires in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 py-4 text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify & Login'
                )}
              </Button>

              {/* Resend OTP (Email Only) */}
              {verificationRequired === 'email_otp' && (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={otpTimer > 0 || loading}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                </button>
              )}

              {/* Back Button */}
              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-cyan-400 font-semibold mb-1">Security Notice</p>
                  <p className="text-xs text-gray-400">
                    {verificationRequired === 'totp'
                      ? 'Open your authenticator app (Google Authenticator, Authy, etc.) to get your 6-digit code.'
                      : 'Check your email inbox and spam folder for the verification code.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: LOGIN/REGISTER SCREEN
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900/80 border border-cyan-500/30 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold text-white">SecureBank</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400">
            {isLogin ? 'Sign in to access your secure account' : 'Join our secure banking platform'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1 bg-slate-800/50 rounded-xl">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setSuccess('');
                setCaptchaChallengeId(null);
                setCaptchaAnswer(null);
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${isLogin
                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setSuccess('');
                setCaptchaChallengeId(null);
                setCaptchaAnswer(null);
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${!isLogin
                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Register
            </button>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="your.email@example.com"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isLogin && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level ? getStrengthColor(passwordStrength) : 'bg-slate-700'
                          }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength >= 3 ? 'text-green-400' : 'text-gray-500'}`}>
                    {passwordStrength === 0 && 'Enter password'}
                    {passwordStrength === 1 && 'Weak'}
                    {passwordStrength === 2 && 'Medium'}
                    {passwordStrength === 3 && 'Strong'}
                    {passwordStrength === 4 && 'Very Strong'}
                  </p>
                </div>
              )}
            </div>

            {/* Phone Number (Register Only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder="+1 (555) 123-4567"
                    autoComplete="tel"
                  />
                </div>
              </div>
            )}

            {/* Admin Registration Toggle (Register Only) */}
            {!isLogin && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="admin-toggle"
                    checked={registerAsAdmin}
                    onChange={(e) => setRegisterAsAdmin(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-slate-800 text-cyan-600 focus:ring-cyan-500/50"
                  />
                  <label htmlFor="admin-toggle" className="text-sm text-gray-300 cursor-pointer select-none">
                    Register as Administrator
                  </label>
                </div>

                {/* Admin Key Input */}
                {registerAsAdmin && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-medium text-cyan-400 mb-2">
                      Admin Secret Key
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-500" />
                      <input
                        type="password"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                        placeholder="Enter secret key provided by IT"
                        required={registerAsAdmin}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CAPTCHA (Login & Register) */}
            <Captcha
              onVerify={(challengeId, answer) => {
                setCaptchaChallengeId(challengeId);
                setCaptchaAnswer(answer);
              }}
              onError={() => {
                setCaptchaChallengeId(null);
                setCaptchaAnswer(null);
              }}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 py-4 text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-cyan-400 font-semibold mb-1">AI-Powered Security</p>
                <p className="text-xs text-gray-400">
                  Your account is protected by advanced fraud detection and multi-factor authentication.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Auth;
