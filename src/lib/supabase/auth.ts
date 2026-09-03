import { supabase } from './client';
import { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export const authService = {
  /**
   * Register a new user with Email and Password
   */
  async signUpWithEmail(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in an existing user with Email and Password
   */
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with OAuth Provider (Google, GitHub, etc.)
   */
  async signInWithOAuth(provider: 'google' | 'github', nextPath = '/habits/today') {
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    callbackUrl.searchParams.set('next', nextPath);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Send a Passwordless Magic Link to user's email
   */
  async sendMagicLink(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out current session
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.warn('Sign out warning:', error.message);
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  },

  /**
   * Get current auth session
   */
  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  },

  /**
   * Listen to real-time auth state changes
   */
  onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null, session);
    });
  },
};
