// useThoughtsStore.js
import { create } from 'zustand';
import { supabase } from '../components/supabaseClient';
import { encryptData, decryptData } from '../utils/e2ee';
import useAuthStore from './useAuthStore';
import toast from 'react-hot-toast';

const useThoughtsStore = create((set, get) => ({
  thoughts: [],
  loading: false,
  dataReady: false,

  fetchThoughts: async () => {
    set({ loading: true, dataReady: false });
    const { user, e2eeKey } = useAuthStore.getState();
    if (!user || !e2eeKey) {
      set({ thoughts: [], loading: false, dataReady: true });
      return;
    }
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
      set({ thoughts: decrypted, loading: false, dataReady: true });
    } catch (e) {
      set({ thoughts: [], loading: false, dataReady: true });
    }
  },

  addThought: async (text) => {
    set({ loading: true });
    const { user, e2eeKey } = useAuthStore.getState();
    if (!user || !e2eeKey) return;
    const thought = {
      id: crypto.randomUUID(),
      thought: text,
      created_at: new Date().toISOString(),
    };
    try {
      const toSave = {
        ...thought,
        thought: await encryptData(e2eeKey, thought.thought),
      };
      const { data, error } = await supabase
        .from('thoughts')
        .insert([{ ...toSave, user_id: user.id }])
        .select();
      if (error) throw error;
      const saved = data[0];
      const decrypted = {
        ...saved,
        thought: saved.thought ? await decryptData(e2eeKey, saved.thought) : '',
      };
      set((state) => ({ thoughts: [decrypted, ...state.thoughts], loading: false }));
      toast.success('Thought added!');
    } catch (e) {
      set({ loading: false });
      toast.error('Failed to add thought');
    }
  },

  editThought: async (id, text) => {
    set({ loading: true });
    const { user, e2eeKey } = useAuthStore.getState();
    if (!user || !e2eeKey) return;
    try {
      const toSave = {
        id,
        thought: await encryptData(e2eeKey, text),
      };
      const { data, error } = await supabase
        .from('thoughts')
        .update({ thought: toSave.thought })
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      if (error) throw error;
      const updated = data[0];
      const decrypted = {
        ...updated,
        thought: updated.thought ? await decryptData(e2eeKey, updated.thought) : '',
      };
      set((state) => ({
        thoughts: state.thoughts.map((t) => (t.id === id ? decrypted : t)),
        loading: false,
      }));
      toast.success('Thought updated!');
    } catch (e) {
      set({ loading: false });
      toast.error('Failed to update thought');
    }
  },

  deleteThought: async (id) => {
    set({ loading: true });
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      await supabase
        .from('thoughts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      set((state) => ({
        thoughts: state.thoughts.filter((t) => t.id !== id),
        loading: false,
      }));
      toast.success('Thought deleted!');
    } catch (e) {
      set({ loading: false });
      toast.error('Failed to delete thought');
    }
  },

  reset: () => set({ thoughts: [], loading: false, dataReady: false }),
}));

export default useThoughtsStore; 