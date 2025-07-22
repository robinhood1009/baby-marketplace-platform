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
        
        // Handle redirect after sign up confirmation
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, baby_age')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            if (profile) {
              if (profile.role === 'mother' && !profile.baby_age) {
                window.location.href = '/onboarding';
              } else if (profile.role === 'mother') {
                window.location.href = '/offers';
              } else if (profile.role === 'vendor') {
                window.location.href = '/vendor-dashboard';
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
      // Update the role in the profile that was automatically created by the trigger
      // We'll wait a moment to ensure the trigger has completed
      setTimeout(async () => {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role: role })
          .eq('user_id', data.user.id);

        if (profileError) {
          console.error('Error updating profile role:', profileError);
        }
      }, 500);
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