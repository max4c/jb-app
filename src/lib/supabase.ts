import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Custom storage that respects "remember me" setting
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    
    // Check if user chose "remember me"
    const rememberMe = localStorage.getItem('rememberMe') !== 'false';
    
    if (rememberMe) {
      return localStorage.getItem(key);
    } else {
      return sessionStorage.getItem(key);
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    
    // Check if user chose "remember me"
    const rememberMe = localStorage.getItem('rememberMe') !== 'false';
    
    if (rememberMe) {
      localStorage.setItem(key, value);
    } else {
      sessionStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: customStorage
  }
})