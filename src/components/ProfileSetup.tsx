'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProfileSetupProps {
  onComplete: (profileData: {
    display_name: string;
    skills: string;
    background: string;
    bio?: string;
    open_to: string[];
    can_provide: string[];
    contact_method: 'slack' | 'email';
    slack_handle?: string;
    linkedin_url?: string;
    twitter_url?: string;
    website_url?: string;
    location?: string;
  }) => Promise<void>;
  isDarkMode: boolean;
}

export default function ProfileSetup({ onComplete, isDarkMode }: ProfileSetupProps) {
  const [name, setName] = useState('');
  const [skills, setSkills] = useState('');
  const [background, setBackground] = useState('');
  const [bio, setBio] = useState('');
  const [openTo, setOpenTo] = useState<string[]>([]);
  const [canProvide, setCanProvide] = useState<string[]>([]);
  const [contactMethod, setContactMethod] = useState<'slack' | 'email'>('slack');
  const [slackHandle, setSlackHandle] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const openToOptions = [
    { value: 'full_time_job_opportunities', label: 'Full Time Job Opportunities' },
    { value: 'part_time_job_opportunities', label: 'Part Time Job Opportunities' },
    { value: 'cofounder_roles', label: 'Cofounder Roles' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'contract_gigs', label: 'Contract Gigs' },
    { value: 'mentoring_others', label: 'Mentoring Others' },
    { value: 'being_mentored', label: 'Being Mentored' },
    { value: 'internships', label: 'Internships' }
  ];

  const handleOpenToChange = (value: string) => {
    setOpenTo(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const handleCanProvideChange = (value: string) => {
    setCanProvide(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await onComplete({
        display_name: name,
        skills: skills,
        background: background,
        bio: bio || undefined,
        open_to: openTo,
        can_provide: canProvide,
        contact_method: contactMethod,
        slack_handle: contactMethod === 'slack' ? slackHandle : undefined,
        linkedin_url: linkedinUrl || undefined,
        twitter_url: twitterUrl || undefined,
        website_url: websiteUrl || undefined,
        location: location || undefined
      });
    } catch (error: any) {
      console.error('Profile setup error:', error);
      setError(error.message || 'Failed to create profile');
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
              Let's set up your profile
            </p>
          </div>
        </div>

        <div className={`border rounded-lg shadow-sm p-8 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="skills" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Skills (comma-separated)
              </label>
              <input
                id="skills"
                type="text"
                required
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="React, TypeScript, Node.js"
              />
            </div>

            <div>
              <label htmlFor="background" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Background (short)
              </label>
              <input
                id="background"
                type="text"
                required
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Ex-Google SWE, Stanford CS"
              />
            </div>

            <div>
              <label htmlFor="bio" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Bio (detailed)
              </label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:border-transparent resize-vertical ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Tell us more about yourself, your experience, what you're passionate about..."
              />
            </div>

            <div>
              <label htmlFor="location" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="San Francisco, CA"
              />
            </div>

            <div>
              <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Social Media & Links
              </h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="linkedinUrl" className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    LinkedIn
                  </label>
                  <input
                    id="linkedinUrl"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <label htmlFor="twitterUrl" className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    X (Twitter)
                  </label>
                  <input
                    id="twitterUrl"
                    type="url"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="https://x.com/yourusername"
                  />
                </div>
                <div>
                  <label htmlFor="websiteUrl" className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Website
                  </label>
                  <input
                    id="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Open To (select all that apply)
              </label>
              <div className="space-y-3">
                {openToOptions.map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={openTo.includes(option.value)}
                      onChange={() => handleOpenToChange(option.value)}
                      className="w-4 h-4 text-[#C84344] bg-transparent border-gray-300 rounded focus:ring-[#C84344] focus:ring-2"
                    />
                    <span className={`ml-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Can Provide/Refer (select all that apply)
              </label>
              <div className="space-y-3">
                {openToOptions.map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canProvide.includes(option.value)}
                      onChange={() => handleCanProvideChange(option.value)}
                      className="w-4 h-4 text-green-600 bg-transparent border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span className={`ml-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="contactMethod" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Contact Method
              </label>
              <select
                id="contactMethod"
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value as 'slack' | 'email')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:border-transparent appearance-none cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${isDarkMode ? '%23a1a1aa' : '%236b7280'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.7rem center',
                  backgroundSize: '1.2em 1.2em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="slack">Slack</option>
                <option value="email">Email</option>
              </select>
            </div>

            {contactMethod === 'slack' && (
              <div>
                <label htmlFor="slackHandle" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Slack Handle
                </label>
                <input
                  id="slackHandle"
                  type="text"
                  required
                  value={slackHandle}
                  onChange={(e) => setSlackHandle(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="your.handle"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C84344] text-white py-2 px-4 rounded-md hover:bg-[#b33a3a] focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating profile...' : 'Complete Setup'}
            </button>
          </form>
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
              Connecting builders across Silicon Valley
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}