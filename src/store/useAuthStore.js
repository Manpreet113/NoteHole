import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../components/supabaseClient';

const useAuthStore = create(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      loading: true,

      // Initialize session on app load
      initSession: async () => {
        const { data } = await supabase.auth.getSession();
        set({ session: data.session, user: data.session?.user || null, loading: false });

        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user || null, loading: false });
        });
      },

      // Email/password sign in
      signIn: async ({ email, password }) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            console.error("Sign-in error:", error.message);
            return { success: false, error };
          }
          return { success: true, data };
        } finally {
          set({ loading: false });
        }
      },

      // Email/password signup
      signUp: async ({ email, password }) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) {
            console.error("Sign-up error:", error.message);
            return { success: false, error };
          }
          return { success: true, data };
        } finally {
          set({ loading: false });
        }
      },

      // OAuth sign-in (Google, GitHub etc)
      signInWithOAuth: async (provider) => {
        set({ loading: true });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: window.location.origin + "/login",
            },
          });
          if (error) console.error("OAuth error:", error.message);
          return { success: true };
        } finally {
          set({ loading: false });
        }
      },

      // Sign out
      signOut: async () => {
        set({ loading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) console.error("Sign-out error:", error.message);
          set({ session: null, user: null });
          return { success: true };
        } finally {
          set({ loading: false });
        }
      },

      // Set session (internal use)
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'auth-storage', // this will persist auth info
    }
  )
);

// Listen for auth state changes and update session
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setSession(session);
  useAuthStore.getState().setLoading(false);
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
  useAuthStore.getState().setLoading(false);
});

export default useAuthStore;
