'use client';

import { Fragment } from 'react';
import Image from 'next/image';

interface Profile {
  id?: string;
  user_id: string;
  display_name: string;
  background: string;
  bio?: string;
  open_to: string[];
  can_provide: string[];
  contact_method: 'slack' | 'email';
  contact_email?: string;
  slack_handle?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  location?: string;
  is_visible: boolean;
  skills: string[];
  created_at?: string;
  updated_at?: string;
}

interface ProfileModalProps {
  profile: Profile;
  onClose: () => void;
  isDarkMode: boolean;
  currentUserId?: string;
}

export default function ProfileModal({ profile, onClose, isDarkMode, currentUserId }: ProfileModalProps) {
  const isOwnProfile = currentUserId === profile.user_id;
  
  const formatOpenToItem = (item: string) => {
    return item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSocialIcon = (url: string) => {
    if (url.includes('linkedin.com')) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      );
    } else if (url.includes('x.com') || url.includes('twitter.com')) {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {profile.display_name}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Background
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {profile.background}
            </p>
          </div>

          {profile.bio && (
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                About
              </h3>
              <p className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {profile.bio}
              </p>
            </div>
          )}

          {profile.location && (
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Location
              </h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {profile.location}
              </p>
            </div>
          )}

          <div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Open To
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.open_to.map((item, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${
                    isDarkMode
                      ? 'bg-blue-900 text-blue-300'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {formatOpenToItem(item)}
                </span>
              ))}
            </div>
          </div>

          {profile.can_provide && profile.can_provide.length > 0 && (
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Can Provide/Refer
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.can_provide.map((item, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${
                      isDarkMode
                        ? 'bg-green-900 text-green-300'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {formatOpenToItem(item)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(profile.linkedin_url || profile.twitter_url || profile.website_url) && (
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Links
              </h3>
              <div className="flex flex-wrap gap-3">
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isDarkMode
                        ? 'text-blue-300 hover:bg-gray-700'
                        : 'text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    {getSocialIcon(profile.linkedin_url)}
                    LinkedIn
                  </a>
                )}
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isDarkMode
                        ? 'text-blue-300 hover:bg-gray-700'
                        : 'text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    {getSocialIcon(profile.twitter_url)}
                    X
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isDarkMode
                        ? 'text-blue-300 hover:bg-gray-700'
                        : 'text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    {getSocialIcon(profile.website_url)}
                    Website
                  </a>
                )}
              </div>
            </div>
          )}

          {isOwnProfile && (
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Contact Information
              </h3>
              <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {profile.contact_method === 'slack' && profile.slack_handle && (
                  <p>Slack: @{profile.slack_handle}</p>
                )}
                {profile.contact_method === 'email' && profile.contact_email && (
                  <p>Email: {profile.contact_email}</p>
                )}
              </div>
            </div>
          )}

          <div className={`pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {profile.created_at && (
                <p>Member since {new Date(profile.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}</p>
              )}
              {profile.updated_at && (
                <p>Profile last updated {new Date(profile.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric', 
                  year: 'numeric'
                })}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}