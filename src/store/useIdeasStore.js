// useIdeasStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../components/supabaseClient';
import { encryptData, decryptData } from '../utils/e2ee';
import useAuthStore from './useAuthStore';
import toast from 'react-hot-toast';

const useIdeasStore = create(
  persist(
    (set, get) => ({
      ideas: [],
      loading: false,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),

      fetchIdeas: async () => {
        const { user, e2eeKey } = useAuthStore.getState();
        if (!user || !e2eeKey) return;

        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from('ideas')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          const decrypted = await Promise.all(
            (data || []).map(async (idea) => ({
              ...idea,
              title: idea.title ? await decryptData(e2eeKey, idea.title) : '',
              description: idea.description ? await decryptData(e2eeKey, idea.description) : '',
            }))
          );
          set({ ideas: decrypted, loading: false });
        } catch (e) {
          toast.error('Failed to fetch ideas.');
          set({ loading: false });
        }
      },

      addIdea: async (title, description) => {
        const { user, e2eeKey } = useAuthStore.getState();
        const idea = {
          id: crypto.randomUUID(),
          user_id: user ? user.id : 'guest',
          title,
          description,
          created_at: new Date().toISOString(),
        };

        set((state) => ({ ideas: [idea, ...state.ideas] }));

        if (user && e2eeKey) {
          try {
            const toSave = { ...idea, title: await encryptData(e2eeKey, idea.title), description: await encryptData(e2eeKey, idea.description) };
            await supabase.from('ideas').insert([{ ...toSave, user_id: user.id }]);
          } catch (e) {
            toast.error('Failed to sync idea.');
          }
        }
      },

      editIdea: async (id, title, description) => {
        const originalIdeas = get().ideas;
        const updatedIdea = { ...originalIdeas.find(i => i.id === id), title, description };
        set((state) => ({
          ideas: state.ideas.map((i) => (i.id === id ? updatedIdea : i)),
        }));

        const { user, e2eeKey } = useAuthStore.getState();
        if (user && e2eeKey) {
          try {
            const toSave = { id, title: await encryptData(e2eeKey, title), description: await encryptData(e2eeKey, description) };
            await supabase.from('ideas').update({ title: toSave.title, description: toSave.description }).eq('id', id).eq('user_id', user.id);
          } catch (e) {
            toast.error('Failed to sync updated idea.');
            set({ ideas: originalIdeas });
          }
        }
      },

      deleteIdea: async (id) => {
        const originalIdeas = get().ideas;
        set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) }));

        const { user } = useAuthStore.getState();
        if (user) {
          try {
            await supabase.from('ideas').delete().eq('id', id).eq('user_id', user.id);
          } catch (e) {
            toast.error('Failed to sync deleted idea.');
            set({ ideas: originalIdeas });
          }
        }
      },

      reset: () => set({ ideas: [], loading: false }),
    }),
    {
      name: 'ideas-storage',
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
    useIdeasStore.persist.clearStorage();
    useIdeasStore.getState().reset();
  }
});

export default useIdeasStore;
