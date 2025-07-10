import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../components/supabaseClient';

const useAuthStore = create(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      loading: true,

      initSession: async () => {
        const { data } = await supabase.auth.getSession();
        set({
          session: data.session,
          user: data.session?.user || null,
          loading: false,
        });
      },

      signIn: async ({ email, password, redirectTo = "/ideas" }) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error("Sign-in error:", error.message);
            return { success: false, error };
          }

          set({
            session: data.session,
            user: data.session?.user || null,
          });

          if (redirectTo) window.location.href = redirectTo;

          return { success: true, data };
        } finally {
          set({ loading: false });
        }
      },

      signUp: async ({ email, password, redirectTo = "/ideas" }) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) {
            console.error("Sign-up error:", error.message);
            return { success: false, error };
          }

          set({
            session: data.session,
            user: data.session?.user || null,
          });

          if (data.session && redirectTo) {
            window.location.href = redirectTo;
          }

          return { success: true, data };
        } finally {
          set({ loading: false });
        }
      },

      signInWithOAuth: async (provider) => {
        set({ loading: true });
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: window.location.origin + "/auth/callback",
          },
        });

        if (error) console.error("OAuth error:", error.message);

        return { success: true };
      },

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

      setSession: (session) =>
        set({
          session,
          user: session?.user || null,
        }),

      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Initialize session once at load
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    useAuthStore.getState().setSession(session);
  }
  useAuthStore.getState().setLoading(false);
});

// Listen to auth state changes globally
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
  useAuthStore.getState().setLoading(false);
});

export default useAuthStore;