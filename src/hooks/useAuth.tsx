import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, role: 'mother' | 'vendor') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle redirect after sign in
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.email); // Debug log
          
          setTimeout(async () => {
            const currentPath = window.location.pathname;
            console.log('Current path after sign in:', currentPath); // Debug log
            
            // Check for admin access FIRST (before profile check)
            if (session.user.email === 'admin@yourdomain.com') {
              console.log('Admin user detected, redirecting to /admin'); // Debug log
              if (currentPath !== '/admin') {
                window.location.href = '/admin';
              }
              return;
            }
            
            // For non-admin users, fetch profile
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role, baby_age')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            if (error) {
              console.error('Error fetching profile:', error);
              return;
            }
            
            console.log('Fetched profile:', profile); // Debug log
            
            if (profile) {
              if (profile.role === 'mother' && !profile.baby_age) {
                if (currentPath !== '/onboarding') {
                  window.location.href = '/onboarding';
                }
              } else if (profile.role === 'mother') {
                if (currentPath !== '/offers') {
                  window.location.href = '/offers';
                }
              } else if (profile.role === 'vendor') {
                if (currentPath !== '/vendor-dashboard') {
                  window.location.href = '/vendor-dashboard';
                }
              }
            } else {
              // No profile found - redirect to home for now
              console.warn('No profile found for user, redirecting to home');
              if (window.location.pathname !== '/') {
                window.location.href = '/';
              }
            }
          }, 100);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, role: 'mother' | 'vendor') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (!error && data.user) {
      // Create profile since the trigger doesn't work on auth.users
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          role: role
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't return error here as user was created successfully
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Redirect to home page after sign out
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};