'use client';

import { useState, useRef, useEffect } from 'react';

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  isDarkMode: boolean;
}

export default function OTPVerification({ email, onVerify, onResend, onBack, isDarkMode }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit)) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) return;

    setIsLoading(true);
    setError('');
    
    try {
      await onVerify(code);
    } catch (error: any) {
      setError(error.message || 'Invalid verification code');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    
    try {
      await onResend();
    } catch (error: any) {
      setError(error.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors ${
      isDarkMode ? 'bg-gray-900' : 'bg-[#F6F6F1]'
    }`}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl font-bold">Z</span>
            </div>
            <div className={`text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {email} 
            </div>
            <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Enter verification code sent to your email
            </p>
          </div>
        </div>

        <div className={`border rounded-lg shadow-sm p-8 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-center mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className={`w-12 h-12 text-center text-xl font-medium border-2 rounded-lg focus:outline-none focus:border-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } ${digit ? 'border-blue-500' : ''}`}
                disabled={isLoading}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {isLoading ? 'Verifying...' : 'Continue'}
          </button>

          <button
            onClick={handleResend}
            disabled={resending}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {resending ? 'Sending...' : 'Resend'}
          </button>

          <div className="mt-6 text-center">
            <button 
              onClick={onBack}
              className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}