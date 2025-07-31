// useThoughtsStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../components/supabaseClient';
import { encryptData, decryptData } from '../utils/e2ee';
import useAuthStore from './useAuthStore';
import toast from 'react-hot-toast';

const useThoughtsStore = create(
  persist(
    (set, get) => ({
      thoughts: [],
      loading: false,
      hydrated: false,
      setHydrated: () => {
        set({ hydrated: true });
      },

      fetchThoughts: async () => {
        const { user, e2eeKey } = useAuthStore.getState();
        if (!user || !e2eeKey) {
          return;
        }

        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from('thoughts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          const decrypted = await Promise.all(
            (data || []).map(async (thought) => ({
              ...thought,
              thought: thought.thought ? await decryptData(e2eeKey, thought.thought) : '',
            }))
          );
          set({ thoughts: decrypted, loading: false });
        } catch (e) {
          toast.error('Failed to fetch thoughts.');
          console.error('useThoughtsStore: fetchThoughts - error:', e);
          set({ loading: false });
        }
      },

      addThought: async (text) => {
        const { user, e2eeKey } = useAuthStore.getState();
        const thought = {
          id: crypto.randomUUID(),
          user_id: user ? user.id : 'guest',
          thought: text,
          created_at: new Date().toISOString(),
        };

        set((state) => ({ thoughts: [thought, ...state.thoughts] }));

        if (user && e2eeKey) {
          try {
            const toSave = { ...thought, thought: await encryptData(e2eeKey, thought.thought) };
            await supabase.from('thoughts').insert([{ ...toSave, user_id: user.id }]);
          } catch (e) {
            toast.error('Failed to sync thought.');
            console.error('useThoughtsStore: addThought - sync error:', e);
            // Note: No rollback on failure, data remains local.
          }
        }
      },

      editThought: async (id, text) => {
        const originalThoughts = get().thoughts;
        const updatedThought = { ...originalThoughts.find(t => t.id === id), thought: text };
        set((state) => ({
          thoughts: state.thoughts.map((t) => (t.id === id ? updatedThought : t)),
        }));

        const { user, e2eeKey } = useAuthStore.getState();
        if (user && e2eeKey) {
          try {
            const toSave = { id, thought: await encryptData(e2eeKey, text) };
            await supabase.from('thoughts').update({ thought: toSave.thought }).eq('id', id).eq('user_id', user.id);
          } catch (e) {
            toast.error('Failed to sync updated thought.');
            console.error('useThoughtsStore: editThought - sync error:', e);
            set({ thoughts: originalThoughts }); // Rollback on failure
          }
        }
      },

      deleteThought: async (id) => {
        const originalThoughts = get().thoughts;
        set((state) => ({ thoughts: state.thoughts.filter((t) => t.id !== id) }));

        const { user } = useAuthStore.getState();
        if (user) {
          try {
            await supabase.from('thoughts').delete().eq('id', id).eq('user_id', user.id);
          } catch (e) {
            toast.error('Failed to sync deleted thought.');
            console.error('useThoughtsStore: deleteThought - sync error:', e);
            set({ thoughts: originalThoughts }); // Rollback on failure
          }
        }
      },

      reset: () => {
        set({ thoughts: [], loading: false });
      },
    }),
    {
      name: 'thoughts-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return () => {
          if (state) {
            state.setHydrated();
          }
        };
      },
    }
  )
);

useAuthStore.subscribe((state, prevState) => {
  if (prevState.user && !state.user) {
    useThoughtsStore.persist.clearStorage();
    useThoughtsStore.getState().reset();
  }
});

export default useThoughtsStore;
