// useTasksStore.js
import { create } from 'zustand';
import { supabase } from '../components/supabaseClient';
import { encryptData, decryptData } from '../utils/e2ee';
import useAuthStore from './useAuthStore';
import toast from 'react-hot-toast';

const useTasksStore = create((set, get) => ({
  tasks: [],
  loading: false,
  dataReady: false,

  fetchTasks: async () => {
    set({ loading: true, dataReady: false });
    const { user, e2eeKey } = useAuthStore.getState();
    if (!user || !e2eeKey) {
      set({ tasks: [], loading: false, dataReady: true });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const decrypted = await Promise.all(
        (data || []).map(async (task) => ({
          ...task,
          name: task.name ? await decryptData(e2eeKey, task.name) : '',
        }))
      );
      set({ tasks: decrypted, loading: false, dataReady: true });
    } catch (e) {
      set({ tasks: [], loading: false, dataReady: true });
    }
  },

  addTask: async (name) => {
    set({ loading: true });
    const { user, e2eeKey } = useAuthStore.getState();
    if (!user || !e2eeKey) return;
    const task = {
      id: crypto.randomUUID(),
      name,
      is_done: false,
      created_at: new Date().toISOString(),
    };
    try {
      const toSave = {
        ...task,
        name: await encryptData(e2eeKey, task.name),
      };
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...toSave, user_id: user.id }])
        .select();
      if (error) throw error;
      const saved = data[0];
      const decrypted = {
        ...saved,
        name: saved.name ? await decryptData(e2eeKey, saved.name) : '',
      };
      set((state) => ({ tasks: [decrypted, ...state.tasks], loading: false }));
      toast.success('Task added!');
    } catch (e) {
      set({ loading: false });
      toast.error('Failed to add task');
    }
  },

  editTask: async (id, name) => {
    set({ loading: true });
    const { user, e2eeKey } = useAuthStore.getState();
    if (!user || !e2eeKey) return;
    try {
      const toSave = {
        id,
        name: await encryptData(e2eeKey, name),
      };
      const { data, error } = await supabase
        .from('tasks')
        .update({ name: toSave.name })
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      if (error) throw error;
      const updated = data[0];
      const decrypted = {
        ...updated,
        name: updated.name ? await decryptData(e2eeKey, updated.name) : '',
      };
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? decrypted : t)),
        loading: false,
      }));
      toast.success('Task updated!');
    } catch (e) {
      set({ loading: false });
      toast.error('Failed to update task');
    }
  },

  toggleTask: async (id) => {
    set({ loading: true });
    const { user, e2eeKey } = useAuthStore.getState();
    if (!user || !e2eeKey) return;
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      const toSave = {
        id,
        name: await encryptData(e2eeKey, task.name),
        is_done: !task.is_done,
      };
      const { data, error } = await supabase
        .from('tasks')
        .update({ name: toSave.name, is_done: toSave.is_done })
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      if (error) throw error;
      const updated = data[0];
      const decrypted = {
        ...updated,
        name: updated.name ? await decryptData(e2eeKey, updated.name) : '',
      };
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? decrypted : t)),
        loading: false,
      }));
      toast.success('Task updated!');
    } catch (e) {
      set({ loading: false });
      toast.error('Failed to update task');
    }
  },

  deleteTask: async (id) => {
    set({ loading: true });
    const { user } = useAuthStore.getState();
    if (!user) return;
    try {
      await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        loading: false,
      }));
      toast.success('Task deleted!');
    } catch (e) {
      set({ loading: false });
      toast.error('Failed to delete task');
    }
  },

  reset: () => set({ tasks: [], loading: false, dataReady: false }),
}));

export default useTasksStore; 