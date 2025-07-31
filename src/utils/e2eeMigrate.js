// e2eeMigrate.js
// Migration utility to encrypt all user data after login
import { encryptData } from './e2ee';

export async function migrateUserData({ user, e2eeKey, supabase }) {
  if (!user || !e2eeKey) return;
  const userId = user.id;
  // Helper: encrypt if not already encrypted
  const ensureEncrypted = async (val) => {
    if (!val || typeof val !== 'string' || val.startsWith('enc:')) return val;
    return await encryptData(e2eeKey, val);
  };

  // Ideas
  try {
    const { data: ideas, error: ideasErr } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', userId);
    if (!ideasErr && Array.isArray(ideas)) {
      for (const idea of ideas) {
        const newTitle = await ensureEncrypted(idea.title);
        const newDesc = await ensureEncrypted(idea.description);
        if (newTitle !== idea.title || newDesc !== idea.description) {
          await supabase
            .from('ideas')
            .update({ title: newTitle, description: newDesc })
            .eq('id', idea.id)
            .eq('user_id', userId);
        }
      }
    }
  } catch {}

  // Thoughts
  try {
    const { data: thoughts, error: thoughtsErr } = await supabase
      .from('thoughts')
      .select('*')
      .eq('user_id', userId);
    if (!thoughtsErr && Array.isArray(thoughts)) {
      for (const thought of thoughts) {
        const newThought = await ensureEncrypted(thought.thought);
        if (newThought !== thought.thought) {
          await supabase
            .from('thoughts')
            .update({ thought: newThought })
            .eq('id', thought.id)
            .eq('user_id', userId);
        }
      }
    }
  } catch {}

  // Tasks
  try {
    const { data: tasks, error: tasksErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);
    if (!tasksErr && Array.isArray(tasks)) {
      for (const task of tasks) {
        const newName = await ensureEncrypted(task.name);
        if (newName !== task.name) {
          await supabase
            .from('tasks')
            .update({ name: newName })
            .eq('id', task.id)
            .eq('user_id', userId);
        }
      }
    }
  } catch {}
} 