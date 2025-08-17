// useAuthStore.js
// Zustand store for authentication state and actions (login, signup, OAuth, session persistence)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../components/supabaseClient';
import { deriveKey } from '../utils/e2ee';
import { migrateUserData } from '../utils/e2eeMigrate';

const SALT = import.meta.env.VITE_E2EE_SALT;

const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      session: null,
      user: null,
      loading: true,
      e2eeKey: null, // Store the derived E2EE key in memory

      // Initialize session from Supabase
      initSession: async () => {
        const { data } = await supabase.auth.getSession();
        let e2eeKey = null;
        if (data.session?.user) {
          e2eeKey = await deriveKey({
            username: data.session.user.email || data.session.user.user_metadata?.username || '',
            userId: data.session.user.id,
            salt: SALT,
          });
        }
        set({
          session: data.session,
          user: data.session?.user || null,
          loading: false,
          e2eeKey,
        });
        // Run migration after login
        if (data.session?.user && e2eeKey) {
          migrateUserData({ user: data.session.user, e2eeKey, supabase });
        }
      },

      // Sign in with email/password
      signIn: async ({ email, password, redirectTo = "/ideas" }) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error("useAuthStore: Sign-in error:", error.message);
            return { success: false, error };
          }

          let e2eeKey = null;
          if (data.session?.user) {
            e2eeKey = await deriveKey({
              username: data.session.user.email || data.session.user.user_metadata?.username || '',
              userId: data.session.user.id,
              salt: SALT,
            });
          }

          set({
            session: data.session,
            user: data.session?.user || null,
            e2eeKey,
          });

          // Run migration after login
          if (data.session?.user && e2eeKey) {
            migrateUserData({ user: data.session.user, e2eeKey, supabase });
          }

          if (redirectTo) window.location.href = redirectTo;

          return { success: true, data };
        } finally {
          set({ loading: false });
        }
      },

      // Sign up with email/password
      signUp: async ({ email, password, redirectTo = "/ideas" }) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) {
            console.error("useAuthStore: Sign-up error:", error.message);
            return { success: false, error };
          }

          let e2eeKey = null;
          if (data.session?.user) {
            e2eeKey = await deriveKey({
              username: data.session.user.email || data.session.user.user_metadata?.username || '',
              userId: data.session.user.id,
              salt: SALT,
            });
          }

          set({
            session: data.session,
            user: data.session?.user || null,
            e2eeKey,
          });

          // Run migration after signup
          if (data.session?.user && e2eeKey) {
            migrateUserData({ user: data.session.user, e2eeKey, supabase });
          }

          if (data.session && redirectTo) {
            window.location.href = redirectTo;
          }

          return { success: true, data };
        } finally {
          set({ loading: false });
        }
      },

      // Sign in with OAuth provider (Google, Github, etc.)
      signInWithOAuth: async (provider) => {
        
        set({ loading: true });
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin + "/auth/callback",
          },
        });

        if (error) console.error("useAuthStore: OAuth error:", error.message);

        return { success: true };
      },

      // Sign out and clear session
      signOut: async () => {
        set({ loading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) console.error("useAuthStore: Sign-out error:", error.message);
          set({ session: null, user: null, e2eeKey: null });
          return { success: true };
        } finally {
          set({ loading: false });
        }
      },

      // Set session and user state
      setSession: async (session) => {
        let e2eeKey = null;
        if (session?.user) {
          e2eeKey = await deriveKey({
            username: session.user.email || session.user.user_metadata?.username || '',
            userId: session.user.id,
            salt: SALT,
          });
        }
        set({
          session,
          user: session?.user || null,
          e2eeKey,
        });
        // Run migration after session set
        if (session?.user && e2eeKey) {
          migrateUserData({ user: session.user, e2eeKey, supabase });
        }
      },

      // Set loading state
      setLoading: (loading) => {
        set({ loading });
      },
    }),
    {
      name: 'auth-storage', // Persist store in localStorage
    }
  )
);

// Helper to check if current URL is a password recovery flow
function isRecoveryFlow() {
  try {
    const url = new URL(window.location.href);
    let type = url.searchParams.get('type');
    if (!type && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      type = hashParams.get('type');
    }
    return type === 'recovery';
  } catch (error) {
    return false;
  }
}

// Only initialize session if not in recovery flow
if (!isRecoveryFlow()) {
  // Initialize session once at load
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session) {
      await useAuthStore.getState().setSession(session);
    }
    useAuthStore.getState().setLoading(false);
  });

  // Listen to auth state changes globally
  supabase.auth.onAuthStateChange(async (_event, session) => {
    // Double-check we're not in recovery flow before processing session
    if (!isRecoveryFlow()) {
      await useAuthStore.getState().setSession(session);
      useAuthStore.getState().setLoading(false);
    }
  });
} else {
  // If in recovery flow, just set loading to false
  useAuthStore.getState().setLoading(false);
}

export default useAuthStore;
