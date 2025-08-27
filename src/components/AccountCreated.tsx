'use client';

import Image from 'next/image';

interface AccountCreatedProps {
  onBackToSignIn: () => void;
  isDarkMode: boolean;
}

export default function AccountCreated({ onBackToSignIn, isDarkMode }: AccountCreatedProps) {
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

        <div className={`border rounded-lg shadow-sm p-8 text-center ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Account Created!</h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Please check your email to complete the sign up process.
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={onBackToSignIn}
              className={`text-sm underline ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
              Back to Sign In
            </button>
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