// useTasksStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../components/supabaseClient';
import { encryptData, decryptData } from '../utils/e2ee';
import useAuthStore from './useAuthStore';
import toast from 'react-hot-toast';

const useTasksStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),

      fetchTasks: async () => {
        const { user, e2eeKey } = useAuthStore.getState();
        if (!user || !e2eeKey) return;

        set({ loading: true });
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
          set({ tasks: decrypted, loading: false });
        } catch (e) {
          toast.error('Failed to fetch tasks.');
          set({ loading: false });
        }
      },

      addTask: async (name) => {
        const { user, e2eeKey } = useAuthStore.getState();
        const task = {
          id: crypto.randomUUID(),
          user_id: user ? user.id : 'guest',
          name,
          is_done: false,
          created_at: new Date().toISOString(),
        };

        set((state) => ({ tasks: [task, ...state.tasks] }));

        if (user && e2eeKey) {
          try {
            const toSave = { ...task, name: await encryptData(e2eeKey, task.name) };
            await supabase.from('tasks').insert([{ ...toSave, user_id: user.id }]);
          } catch (e) {
            toast.error('Failed to sync task.');
          }
        }
      },

      editTask: async (id, name) => {
        const originalTasks = get().tasks;
        const updatedTask = { ...originalTasks.find(t => t.id === id), name };
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        }));

        const { user, e2eeKey } = useAuthStore.getState();
        if (user && e2eeKey) {
          try {
            const toSave = { id, name: await encryptData(e2eeKey, name) };
            await supabase.from('tasks').update({ name: toSave.name }).eq('id', id).eq('user_id', user.id);
          } catch (e) {
            toast.error('Failed to sync updated task.');
            set({ tasks: originalTasks });
          }
        }
      },

      toggleTask: async (id) => {
        const originalTasks = get().tasks;
        const task = originalTasks.find((t) => t.id === id);
        if (!task) return;

        const updatedTask = { ...task, is_done: !task.is_done };
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        }));

        const { user, e2eeKey } = useAuthStore.getState();
        if (user && e2eeKey) {
          try {
            const toSave = { id, name: await encryptData(e2eeKey, task.name), is_done: !task.is_done };
            await supabase.from('tasks').update({ name: toSave.name, is_done: toSave.is_done }).eq('id', id).eq('user_id', user.id);
          } catch (e) {
            toast.error('Failed to sync toggled task.');
            set({ tasks: originalTasks });
          }
        }
      },

      deleteTask: async (id) => {
        const originalTasks = get().tasks;
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));

        const { user } = useAuthStore.getState();
        if (user) {
          try {
            await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id);
          } catch (e) {
            toast.error('Failed to sync deleted task.');
            set({ tasks: originalTasks });
          }
        }
      },

      reset: () => set({ tasks: [], loading: false }),
    }),
    {
      name: 'tasks-storage',
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
    useTasksStore.persist.clearStorage();
    useTasksStore.getState().reset();
  }
});

export default useTasksStore;
