'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface SignInProps {
  onSignIn: (email: string) => Promise<string | void>;
  onShowSignUp?: () => void;
  onShowOTP?: (email: string) => void;
  isDarkMode: boolean;
}

export default function SignIn({ onSignIn, onShowSignUp, onShowOTP, isDarkMode }: SignInProps) {
  const [email, setEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize remember me from localStorage
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe');
    if (savedRememberMe !== null) {
      setRememberMe(savedRememberMe === 'true');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Store the remember me preference
      localStorage.setItem('rememberMe', rememberMe.toString());
      
      // Send OTP to email
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false // Don't create user if they don't exist
        }
      });

      if (error) {
        throw error;
      }

      // Show success message instead of OTP screen
      setSuccess('Check your email for a magic link to sign in!');
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors ${
      isDarkMode ? 'bg-gray-900' : 'bg-[#F6F6F1]'
    }`}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-6">
            <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome to Z
            </h1>
            <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Z is a private community for JustBuild Members
            </p>
          </div>
        </div>

        <div className={`border rounded-lg shadow-sm p-8 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Sign In
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="you@example.com"
              />
            </div>

            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#C84344] bg-transparent border-gray-300 rounded focus:ring-[#C84344] focus:ring-2"
              />
              <label htmlFor="rememberMe" className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C84344] text-white py-2 px-4 rounded-md hover:bg-[#b33a3a] focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending magic link...' : 'Send Magic Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <button 
                onClick={onShowSignUp}
                className="text-[#C84344] hover:underline font-medium"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="JustBuild Logo"
              width={24}
              height={24}
              className="mr-2"
            />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Connecting Silicon Valley to Silicon Slopes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}