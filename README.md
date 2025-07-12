# 🕳️ NoteHole

> Where thoughts go to disappear.

NoteHole is a note-taking app I built from scratch while teaching myself React, Tailwind CSS, and Supabase.  
No fancy team, no tutorial copy-paste — just me trying to figure things out one bug at a time.

This project is a learning playground, a productivity tool, and a mildly chaotic brain dump — all rolled into one.

## 💡 What It Does

- Take notes (duh)
- Organize thoughts into sections (Tasks, Ideas, Thoughts)
- Syncs with Supabase (PostgreSQL + Auth + Realtime vibes)
- Keyboard shortcuts, fuzzy search, dark mode — the works
- Auth with Google, GitHub, Email/Password
- Fully responsive & built with love (and occasional frustration)

## 🧠 Why I Made This

I wanted to:
- Get better at React and state management (hello Zustand 👋)
- Learn how to actually build stuff with Supabase
- Make a personal notes app that doesn’t feel like a corporate SaaS clone

This is not a clone. It’s **NoteHole**. You’ve been warned.

## ⚙️ Tech Stack

- React
- Tailwind CSS
- Supabase (DB + Auth + Storage)
- Zustand
- Fuse.js (for fuzzy search)
- Vite
- Maybe some 💀 spaghetti logic I’ll fix later

## 🔐 Client-Side Encryption

BrainDump now includes **client-side encryption** for all your data:

- **End-to-end encryption**: Your ideas, thoughts, and tasks are encrypted before being stored
- **User-specific keys**: Each user gets a unique encryption key derived from their credentials
- **Zero-knowledge**: Even the server can't read your encrypted data
- **Backward compatible**: Works with existing data and guest users

### How it works:
1. When you log in, a unique encryption key is generated from your user ID and email
2. All data is encrypted with AES-256-GCM before being sent to Supabase
3. Data is also encrypted in localStorage for offline use
4. Keys are stored locally and cleared on logout

### Environment Variables:
Add to your `.env` file:
```
VITE_ENCRYPTION_SALT=your-secure-salt-here
```

## 🚧 Disclaimer

This whole project is a WIP. Expect bugs, weird UI behavior, and maybe a few `console.log("why u no work")` lying around.

But hey — it works. Kinda.

## ✌️ Credits

Made with zero external help.  
(Unless you count Stack Overflow, ChatGPT, 3 AM breakdowns, and caffeine.)

---