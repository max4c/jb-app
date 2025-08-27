'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import SignIn from '@/components/SignIn';
import SignUp from '@/components/SignUp';
import AccountCreated from '@/components/AccountCreated';
import OTPVerification from '@/components/OTPVerification';
import ProfileSetup from '@/components/ProfileSetup';
import ProfileModal from '@/components/ProfileModal';
import MultiSelect from '@/components/MultiSelect';
import { supabase } from '@/lib/supabase';
import { useDarkMode } from '@/hooks/useDarkMode';

interface Profile {
  id?: string;
  user_id: string;
  display_name: string;
  background: string;
  bio?: string; // Longer description
  open_to: string[];
  can_provide: string[]; // What they can offer/refer others to
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

interface Skill {
  id: number;
  name: string;
  category: string;
}

// Functions to interact with Supabase
const fetchProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_visible', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  
  // Ensure all profiles have can_provide field
  return (data || []).map(profile => ({
    ...profile,
    can_provide: profile.can_provide || []
  }));
};

const fetchSkills = async (): Promise<Skill[]> => {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('category', { ascending: true });
  
  if (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
  
  return data || [];
};

const createProfile = async (profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile | null> => {
  console.log('Attempting to create profile with data:', profile);
  
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();
  
  if (error) {
    console.error('Profile creation error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }
  
  return data;
};

const updateProfile = async (userId: string, profile: Partial<Profile>): Promise<Profile | null> => {
  // Ensure can_provide exists and is an array
  const updateData = {
    ...profile,
    can_provide: profile.can_provide || [],
    updated_at: new Date().toISOString()
  };
  
  console.log('Updating profile with data:', updateData);
  console.log('Updating profile for user_id:', userId);
  console.log('Current auth user:', (await supabase.auth.getUser()).data.user?.id);
  
  console.log('Attempting direct update...');
  
  try {
    console.log('Calling supabase.from(profiles).update...');
    const updatePromise = supabase
      .from('profiles')
      .update({
        display_name: updateData.display_name,
        background: updateData.background,
        skills: updateData.skills,
        open_to: updateData.open_to,
        can_provide: updateData.can_provide,
        contact_method: updateData.contact_method,
        slack_handle: updateData.slack_handle,
        contact_email: updateData.contact_email,
        updated_at: updateData.updated_at
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    console.log('Waiting for Supabase response...');
    const { data, error } = await updatePromise;
    console.log('Supabase response received:', { data, error });
    
    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }
    
    if (!data) {
      console.error('Update succeeded but no data returned');
      throw new Error('Update succeeded but no data returned');
    }
    
    console.log('Profile updated successfully:', data);
    return data;
    
  } catch (updateError) {
    console.error('Error in update operation:', updateError);
    throw updateError;
  }
};

const deleteProfile = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
};

export default function Home() {
  const { isDarkMode } = useDarkMode();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showAccountCreated, setShowAccountCreated] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'display_name'>('created_at');
  const [filterBy, setFilterBy] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'open_to' | 'can_provide'>('all');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    skills: '',
    background: '',
    open_to: [] as string[],
    can_provide: [] as string[],
    contact_method: 'slack' as 'slack' | 'email',
    slack_handle: '',
    contact_email: ''
  });

  const loadData = async () => {
    try {
      console.log('Loading data...');
      const [profilesData, skillsData] = await Promise.all([
        fetchProfiles(),
        fetchSkills()
      ]);
      console.log('Loaded profiles:', profilesData);
      setProfiles(profilesData);
      setSkills(skillsData);
      applyFiltersAndSort(profilesData, searchTerm, sortBy, filterBy, filterType);
      console.log('Data loading complete');
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const applyFiltersAndSort = (
    profilesData: Profile[], 
    search: string, 
    sort: string, 
    filter: string,
    type: 'all' | 'open_to' | 'can_provide' = 'all'
  ) => {
    let filtered = [...profilesData];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(profile =>
        profile.display_name.toLowerCase().includes(search.toLowerCase()) ||
        profile.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase())) ||
        profile.background.toLowerCase().includes(search.toLowerCase()) ||
        profile.open_to.some(openTo => openTo.toLowerCase().includes(search.toLowerCase())) ||
        (profile.can_provide && profile.can_provide.some(canProvide => canProvide.toLowerCase().includes(search.toLowerCase())))
      );
    }

    // Apply category filter
    if (filter !== 'all') {
      filtered = filtered.filter(profile => {
        const filterLower = filter.toLowerCase();
        
        if (type === 'open_to') {
          return profile.open_to.some(openTo => openTo.toLowerCase().includes(filterLower));
        } else if (type === 'can_provide') {
          return profile.can_provide && profile.can_provide.some(canProvide => canProvide.toLowerCase().includes(filterLower));
        } else {
          // Default: search both
          return profile.open_to.some(openTo => openTo.toLowerCase().includes(filterLower)) ||
                 (profile.can_provide && profile.can_provide.some(canProvide => canProvide.toLowerCase().includes(filterLower)));
        }
      });
    }

    // Apply sorting
    if (sort === 'display_name') {
      filtered.sort((a, b) => a.display_name.localeCompare(b.display_name));
    } else {
      filtered.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    }

    setFilteredProfiles(filtered);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFiltersAndSort(profiles, term, sortBy, filterBy, filterType);
  };

  const handleAddProfile = () => {
    setFormData({
      display_name: '',
      skills: '',
      background: '',
      open_to: [],
      can_provide: [],
      contact_method: 'slack',
      slack_handle: '',
      contact_email: ''
    });
    setEditingProfile(null);
    setShowForm(true);
  };

  const handleEditProfile = (profile: Profile) => {
    // Only allow editing if it's the current user's profile
    if (currentUser && profile.user_id !== currentUser.id) {
      alert("You can only edit your own profile");
      return;
    }
    
    setFormData({
      display_name: profile.display_name,
      skills: profile.skills.join(', '),
      background: profile.background,
      open_to: profile.open_to || [],
      can_provide: profile.can_provide || [],
      contact_method: profile.contact_method,
      slack_handle: profile.slack_handle || '',
      contact_email: profile.contact_email || ''
    });
    setEditingProfile(profile);
    setShowForm(true);
  };

  const handleViewProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setSelectedProfile(null);
    setShowProfileModal(false);
  };

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


  const handleDeleteProfile = async (userId: string) => {
    // Only allow deleting if it's the current user's profile
    if (currentUser && userId !== currentUser.id) {
      alert("You can only delete your own profile");
      return;
    }

    try {
      await deleteProfile(userId);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('You must be logged in to create/edit a profile');
      return;
    }

    const profileData: Omit<Profile, 'created_at' | 'updated_at'> = {
      user_id: currentUser.id,
      display_name: formData.display_name,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      background: formData.background,
      open_to: formData.open_to,
      can_provide: formData.can_provide || [],
      contact_method: formData.contact_method,
      slack_handle: formData.contact_method === 'slack' ? formData.slack_handle || null : null,
      contact_email: formData.contact_method === 'email' ? formData.contact_email || null : null,
      is_visible: true
    };

    // Store the editing state before clearing
    const isEditing = editingProfile !== null;
    
    // Close modal immediately for better UX
    setShowForm(false);
    setEditingProfile(null);
    
    try {
      console.log('Submitting profile data:', profileData);
      if (isEditing) {
        console.log('Updating existing profile for user:', currentUser.id);
        await updateProfile(currentUser.id, profileData);
      } else {
        console.log('Creating new profile');
        await createProfile(profileData);
      }
      
      console.log('Profile saved successfully');
      
      // Force a slight delay before reloading to ensure database consistency
      setTimeout(() => {
        console.log('Reloading data after update...');
        loadData();
      }, 100);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(`Failed to save profile: ${error.message}`);
      // Reload data even on error in case partial update occurred
      loadData();
    }
  };

  const COMMUNITY_PASSWORD = 'justbuild2025';

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setCurrentUser(session.user);
        loadData(); // Load profiles when authenticated
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setIsAuthenticated(true);
          setCurrentUser(session.user);
          
          // Reset OTP state on successful authentication
          setShowOTP(false);
          setOtpEmail('');
          
          // Always check if user has a profile and create if missing
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('user_id', session.user.id)
            .single();

          if (!existingProfile) {
            console.log('No profile found for user:', session.user.id, 'Showing profile setup...');
            // Show profile setup instead of trying to create automatically
            setShowProfileSetup(true);
          } else {
            console.log('✅ User already has a profile');
            setShowProfileSetup(false);
          }
          
          loadData(); // Load profiles when authenticated
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setProfiles([]);
          setFilteredProfiles([]);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Update filters when dependencies change
  useEffect(() => {
    applyFiltersAndSort(profiles, searchTerm, sortBy, filterBy, filterType);
  }, [profiles, searchTerm, sortBy, filterBy, filterType]);

  const handleSignIn = async (email: string) => {
    // This is now handled in SignIn component
  };

  const handleShowOTP = (email: string) => {
    setOtpEmail(email);
    setShowOTP(true);
  };

  const handleOTPVerify = async (otp: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: otpEmail,
      token: otp,
      type: 'email'
    });

    if (error) {
      throw error;
    }

    // Success - user will be authenticated via the auth state change listener
  };

  const handleOTPResend = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: otpEmail
    });

    if (error) {
      throw error;
    }
  };

  const handleBackFromOTP = () => {
    setShowOTP(false);
    setOtpEmail('');
  };

  const handleProfileSetupComplete = async (profileData: {
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
  }) => {
    if (!currentUser) return;

    const fullProfileData = {
      user_id: currentUser.id,
      display_name: profileData.display_name,
      skills: profileData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s),
      background: profileData.background,
      bio: profileData.bio || undefined,
      open_to: profileData.open_to, // Already an array
      can_provide: profileData.can_provide, // Already an array
      contact_method: profileData.contact_method,
      slack_handle: profileData.contact_method === 'slack' ? profileData.slack_handle || '' : null,
      contact_email: currentUser.email || '',
      linkedin_url: profileData.linkedin_url || undefined,
      twitter_url: profileData.twitter_url || undefined,
      website_url: profileData.website_url || undefined,
      location: profileData.location || undefined,
      is_visible: true
    };

    console.log('Creating profile with data:', fullProfileData);
    
    try {
      await createProfile(fullProfileData);
      console.log('✅ Profile created successfully');
      setShowProfileSetup(false);
      loadData(); // Reload data to show the new profile
    } catch (error) {
      console.error('❌ Profile creation failed:', error);
      throw error; // Let the ProfileSetup component handle the error display
    }
  };

  const handleSignUp = async (email: string, communityPassword: string) => {
    if (communityPassword !== COMMUNITY_PASSWORD) {
      throw new Error('Invalid community password');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'temp-password-' + Math.random(), // Temp password, won't be used
    });

    if (error) {
      throw error;
    }

    // Show account created page
    setShowAccountCreated(true);
    return 'ACCOUNT_CREATED';
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-[#F6F6F1]'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C84344] mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showAccountCreated) {
      return (
        <AccountCreated 
          onBackToSignIn={() => {
            setShowAccountCreated(false);
            setShowSignUp(false);
          }}
          isDarkMode={isDarkMode}
        />
      );
    }
    
    if (showSignUp) {
      return (
        <SignUp 
          onSignUp={handleSignUp} 
          onShowSignIn={() => setShowSignUp(false)}
          isDarkMode={isDarkMode}
        />
      );
    }
    
    if (showOTP) {
      return (
        <OTPVerification
          email={otpEmail}
          onVerify={handleOTPVerify}
          onResend={handleOTPResend}
          onBack={handleBackFromOTP}
          isDarkMode={isDarkMode}
        />
      );
    }
    
    return (
      <SignIn 
        onSignIn={handleSignIn} 
        onShowSignUp={() => setShowSignUp(true)}
        onShowOTP={handleShowOTP}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Show profile setup if authenticated but no profile
  if (isAuthenticated && showProfileSetup) {
    return (
      <ProfileSetup 
        onComplete={handleProfileSetupComplete}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-[#F6F6F1] text-black'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="JustBuild Logo"
                width={48}
                height={48}
              />
              <h1 className="text-xl font-bold">Z</h1>
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                A private community for JustBuild Members
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className={`px-4 py-2 text-sm rounded transition-colors ${
                isDarkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Sign Out
            </button>
          </div>
          
          <div className="flex gap-4 items-center mb-6">
            <input
              type="text"
              placeholder="Search skills, background, or interests..."
              className={`flex-1 px-4 py-2 border rounded text-sm transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-[#C84344]'
                  : 'bg-white border-gray-300 text-black placeholder-gray-500 focus:border-[#C84344]'
              } focus:outline-none focus:ring-2 focus:ring-[#C84344] focus:ring-opacity-20`}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'open_to' | 'can_provide')}
              className={`px-3 py-2 border rounded text-sm transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-black'
              }`}
            >
              <option value="all">All People</option>
              <option value="open_to">Looking For</option>
              <option value="can_provide">Can Help With</option>
            </select>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className={`px-3 py-2 border rounded text-sm transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-black'
              }`}
            >
              <option value="all">All Opportunities</option>
              <option value="full_time">Full Time Jobs</option>
              <option value="part_time">Part Time Jobs</option>
              <option value="cofounder">Co-founder Roles</option>
              <option value="consulting">Consulting</option>
              <option value="contract">Contract Gigs</option>
              <option value="mentoring">Mentoring</option>
              <option value="internship">Internships</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'created_at' | 'display_name')}
              className={`px-3 py-2 border rounded text-sm transition-colors ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-black'
              }`}
            >
              <option value="created_at">Newest First</option>
              <option value="display_name">Name A-Z</option>
            </select>
            {currentUser && (
              <button 
                onClick={() => {
                  // Find current user's profile and edit it
                  const userProfile = profiles.find(p => p.user_id === currentUser.id);
                  if (userProfile) {
                    handleEditProfile(userProfile);
                  } else {
                    handleAddProfile(); // Create profile if doesn't exist
                  }
                }}
                className="px-6 py-2 bg-[#C84344] text-white rounded hover:bg-[#b33a3a] text-sm transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </header>

        <main>
          <div className="space-y-4">
            {filteredProfiles.map(profile => (
              <div 
                key={profile.user_id} 
                className={`p-4 rounded border cursor-pointer hover:shadow-md transition-all ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleViewProfile(profile)}
              >
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{profile.display_name}</h3>
                  
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {profile.background}
                  </div>
                  
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Skills: {profile.skills.slice(0, 3).join(', ')}{profile.skills.length > 3 ? '...' : ''}
                  </div>
                  
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Open to: {profile.open_to.slice(0, 2).map(item => 
                      item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                    ).join(', ')}{profile.open_to.length > 2 ? '...' : ''}
                  </div>
                  
                  {profile.can_provide && profile.can_provide.length > 0 && (
                    <div className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      Can provide: {profile.can_provide.slice(0, 2).map(item => 
                        item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                      ).join(', ')}{profile.can_provide.length > 2 ? '...' : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredProfiles.length === 0 && (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm ? `No profiles found matching "${searchTerm}"` : 'No profiles found'}
              </div>
            )}
          </div>
        </main>

        {showForm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                console.log('Clicked outside modal');
                setShowForm(false);
                setEditingProfile(null);
              }
            }}
          >
            <div className={`rounded-lg p-6 w-full max-w-md ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className="text-lg font-bold mb-4">
                {editingProfile ? 'Edit Profile' : 'Add Profile'}
              </h2>
              
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    className={`w-full px-3 py-2 border rounded text-sm ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                    value={formData.display_name}
                    onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="React, TypeScript, Node.js"
                    className={`w-full px-3 py-2 border rounded text-sm ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-black placeholder-gray-500'
                    }`}
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Background
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex-Google SWE, Stanford CS"
                    className={`w-full px-3 py-2 border rounded text-sm ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-black placeholder-gray-500'
                    }`}
                    value={formData.background}
                    onChange={(e) => setFormData({...formData, background: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    I am Open To
                  </label>
                  <MultiSelect
                    options={openToOptions}
                    selected={formData.open_to}
                    onChange={(selected) => setFormData({...formData, open_to: selected})}
                    placeholder="Select what you're open to..."
                    isDarkMode={isDarkMode}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    I can Provide/Refer
                  </label>
                  <MultiSelect
                    options={openToOptions}
                    selected={formData.can_provide}
                    onChange={(selected) => setFormData({...formData, can_provide: selected})}
                    placeholder="Select what you can provide..."
                    isDarkMode={isDarkMode}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Contact Method
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded text-sm ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-black'
                    }`}
                    value={formData.contact_method}
                    onChange={(e) => setFormData({...formData, contact_method: e.target.value as 'slack' | 'email'})}
                  >
                    <option value="slack">Slack</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                
                {formData.contact_method === 'slack' ? (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Slack Handle
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="your.handle"
                      className={`w-full px-3 py-2 border rounded text-sm ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-black placeholder-gray-500'
                      }`}
                      value={formData.slack_handle}
                      onChange={(e) => setFormData({...formData, slack_handle: e.target.value})}
                    />
                  </div>
                ) : (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      className={`w-full px-3 py-2 border rounded text-sm ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-black placeholder-gray-500'
                      }`}
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    />
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#C84344] text-white px-4 py-2 rounded hover:bg-[#b33a3a] text-sm transition-colors"
                  >
                    {editingProfile ? 'Update Profile' : 'Add Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Cancel button clicked');
                      setShowForm(false);
                      setEditingProfile(null);
                    }}
                    className={`flex-1 px-4 py-2 rounded text-sm transition-colors ${
                      isDarkMode
                        ? 'bg-gray-600 text-white hover:bg-gray-500'
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showProfileModal && selectedProfile && (
          <ProfileModal
            profile={selectedProfile}
            onClose={handleCloseProfileModal}
            isDarkMode={isDarkMode}
            currentUserId={currentUser?.id}
          />
        )}
      </div>
    </div>
  );
}
