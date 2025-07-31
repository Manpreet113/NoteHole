// useIdeasStore.js
import { create } from 'zustand';
import { supabase } from '../components/supabaseClient';
import { encryptData, decryptData } from '../utils/e2ee';
import useAuthStore from './useAuthStore';
import toast from 'react-hot-toast';

const useIdeasStore = create((set, get) => ({
  ideas: [],
  loading: false,
  dataReady: false,

  // Fetch and decrypt all ideas for the current user
  fetchIdeas: async () => {
    set({ loading: true, dataReady: false });
    const { user, e2eeKey } = useAuthStore.getState();
    if (!user || !e2eeKey) {
      set({ ideas: [], loading: false, dataReady: true });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Decrypt fields
      const decrypted = await Promise.all(
        (data || []).map(async (idea) => ({
          ...idea,
          title: idea.title ? await decryptData(e2eeKey, idea.title) : '',
          description: idea.description ? await decryptData(e2eeKey, idea.description) : '',
        }))
      );
      set({ ideas: decrypted, loading: false, dataReady: true });
    } catch (e) {
      set({ ideas: [], loading: false, dataReady: true });
    }
  },

  // Add a new idea
  addIdea: async (title, description) => {
    set({ loading: true });
    const { user, e2eeKey } = useAuthStore.getState();
    if (!user || !e2eeKey) return;
    const idea = {
      id: crypto.randomUUID(),
      title,
      description,
      created_at: new Date().toISOString(),
    };
    try {
      const toSave = {
        ...idea,
        title: await encryptData(e2eeKey, idea.title),
        description: await encryptData(e2eeKey, idea.description),
      };
      const { data, error } = await supabase
        .from('ideas')
        .insert([{ ...toSave, user_id: user.id }])
        .select();
      if (error) throw error;
      const saved = data[0];
      const decrypted = {
        ...saved,
        title: saved.title ? await decryptData(e2eeKey, saved.title) : '',
        description: saved.description ? await decryptData(e2eeKey, saved.description) : '',
      };
      set((state) => ({ ideas: [decrypted, ...state.ideas], loading: false }));
      toast.success('Idea added!');
    } catch (e) {
      set({ loading: false });
      toast.error('Failed to add idea');
    }
  },

  // Edit an idea
  editIdea: async (id, title, description) => {
    set({ loading: true });
    const { user, e2eeKey } = useAuthStore.getState();
    if (!user || !e2eeKey) return;
    try {
      const toSave = {
        id,
        title: await encryptData(e2eeKey, title),
        description: await encryptData(e2eeKey, description),
      };
      const { data, error } = await supabase
        .from('ideas')
        .update({ title: toSave.title, description: toSave.description })
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      if (error) throw error;
      const updated = data[0];
      const decrypted = {
        ...updated,
        title: updated.title ? await decryptData(e2eeKey, updated.title) : '',
        description: updated.description ? await decryptData(e2eeKey, updated.description) : '',
      };
      set((state) => ({
        ideas: state.ideas.map((idea) => (idea.id === id ? decrypted : idea)),
        loading: false,
      }));
      toast.success('Idea updated!');
    } catch (e) {
      set({ loading: false });
      toast.error('Failed to update idea');
    }
  },

  // Delete an idea
  deleteIdea: async (id) => {
    set({ loading: true });
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      await supabase
        .from('ideas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      set((state) => ({
        ideas: state.ideas.filter((idea) => idea.id !== id),
        loading: false,
      }));
      toast.success('Idea deleted!');
    } catch (e) {
      set({ loading: false });
      toast.error('Failed to delete idea');
    }
  },

  // Mark data as not ready (e.g., on logout)
  reset: () => set({ ideas: [], loading: false, dataReady: false }),
}));

export default useIdeasStore; 