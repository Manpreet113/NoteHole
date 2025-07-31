# Future Upgrade Plan for NoteHole

## Our Goal

Our goal is to significantly improve NoteHole's user experience, performance, security, and maintainability, with a strong focus on robust offline capabilities and guest user support.

---

### **Phase 1: Foundational Improvements & Core Feature Enhancements**

**Objective:** To upgrade the text parser, enhance guest user experience, and implement initial performance optimizations.

*   **Task 1.1: Text Parser Upgrade (Markdown Support)**
    *   **Description:** We will replace the current `parseText` utility with a more robust solution that supports basic Markdown formatting (e.g., bold, italics, lists, links). This will enhance the visual presentation of our content.
    *   **Affected Areas:** `src/utils/parseText.jsx`, `src/pages/Thoughts.jsx`, `src/pages/Ideas.jsx`, `src/pages/Tasks.jsx`.
    *   **Sub-tasks:**
        *   We will research and select a lightweight Markdown parsing library (e.g., `marked`, `markdown-it`).
        *   We will integrate the chosen library into `parseText.jsx`.
        *   We will update display components (`Thoughts.jsx`, `Ideas.jsx`, `Tasks.jsx`) to render the parsed Markdown.
        *   We will add basic Markdown input hints to relevant input fields.

*   **Task 1.2: Enhanced Guest User Experience**
    *   **Description:** We will improve the onboarding for guest users and provide a clear path for data migration to a registered account.
    *   **Affected Areas:** `src/store/useAuthStore.js`, `src/store/useThoughtsStore.js`, `src/store/useIdeasStore.js`, `src/store/useTasksStore.js`, `src/pages/Landing.jsx`, `src/components/Login.jsx` (or a new migration component).
    *   **Sub-tasks:**
        *   **Guest Onboarding:** We will add a prominent, dismissible banner or modal for guest users explaining local storage limitations and encouraging sign-up/login.
        *   **Data Migration Feature:**
            *   We will create a new UI component for data migration (e.g., "Migrate Data").
            *   We will implement a function in `useAuthStore` (or a new utility) to handle the migration:
                *   When a guest logs in/signs up, we will retrieve all local guest data from `localStorage`.
                *   We will encrypt this data using the new user's `e2eeKey`.
                *   We will upload the encrypted data to Supabase, associating it with the new `user_id`.
                *   We will clear the guest data from `localStorage` after successful migration.

*   **Task 1.3: Initial Performance Optimization (Code Splitting)**
    *   **Description:** We will implement route-based code splitting to reduce the initial bundle size and improve load times.
    *   **Affected Areas:** `src/main.jsx`, `src/App.jsx`, and individual page components (`src/pages/*`).
    *   **Sub-tasks:**
        *   We will identify main routes in `App.jsx`.
        *   We will use `React.lazy()` and `Suspense` to dynamically import page components.
        *   We will verify bundle size reduction using `vite-bundle-visualizer` (or similar).

---

### **Phase 2: Advanced Offline & Data Management**

**Objective:** To implement robust background synchronization and a clear conflict resolution strategy.

*   **Task 2.1: Background Sync API Integration**
    *   **Description:** We will utilize the Web Background Sync API to queue and synchronize offline changes (add, edit, delete) with Supabase when connectivity is restored, even if the app is closed.
    *   **Affected Areas:** `vite.config.js` (PWA config), `src/service-worker.js` (new file), `src/store/*Store.js` (add sync logic).
    *   **Sub-tasks:**
        *   We will configure `vite-plugin-pwa` to enable background sync.
        *   We will create a dedicated service worker file (`src/service-worker.js`) to handle sync events.
        *   We will modify `add`, `edit`, `delete` actions in `useThoughtsStore`, `useIdeasStore`, `useTasksStore` to:
            *   Immediately update local state.
            *   Queue the change using `navigator.serviceWorker.ready.then(reg => reg.sync.register('my-sync-tag'))`.
            *   Handle the sync event in the service worker to push changes to Supabase.

*   **Task 2.2: Conflict Resolution Strategy**
    *   **Description:** We will define and implement a strategy for resolving data conflicts that may arise from concurrent modifications (e.g., "last write wins" or a more sophisticated approach).
    *   **Affected Areas:** `src/store/*Store.js` (sync logic), Supabase database schema (if versioning is needed).
    *   **Sub-tasks:**
        *   **Strategy Definition:** For simplicity, we will initially implement "last write wins" based on `updated_at` timestamps.
        *   **Implementation:** When syncing data from the client to Supabase, we will compare timestamps. If the server's version is newer, we will decide whether to overwrite, merge, or flag for user attention. For this phase, overwriting with the client's change (if newer) or discarding the client's change (if older) is a good start.

---

### **Phase 3: Security & Data Integrity**

**Objective:** To enhance E2EE key management and implement comprehensive input validation.

*   **Task 3.1: E2EE Key Management Refinement**
    *   **Description:** We will review and potentially enhance the derivation and storage of E2EE keys.
    *   **Affected Areas:** `src/utils/e2ee.js`, `src/store/useAuthStore.js`.
    *   **Sub-tasks:**
        *   **Salt Management:** We will ensure the `SALT` is truly unique per user and securely managed (e.g., derived from user credentials and a global constant).
        *   **Key Rotation (Optional but Recommended):** We will explore mechanisms for users to rotate their encryption keys without losing data. This is a complex task and might be deferred to a later phase.

*   **Task 3.2: Comprehensive Input Validation**
    *   **Description:** We will implement robust validation for all user inputs to prevent invalid data and potential security vulnerabilities.
    *   **Affected Areas:** `src/pages/*jsx` (client-side), `src/store/*Store.js` (before saving/syncing).
    *   **Sub-tasks:**
        *   **Client-Side Validation:** We will add basic validation (e.g., length constraints, required fields) to form inputs.
        *   **Store-Level Validation:** We will implement more rigorous validation logic within the `add`, `edit` actions of each store before data is saved locally or synced to Supabase.

---

### **Phase 4: Testing & Maintainability**

**Objective:** To establish a comprehensive testing strategy and begin migrating to TypeScript.

*   **Task 4.1: Comprehensive Test Suite**
    *   **Description:** We will develop a robust suite of tests to ensure the reliability and correctness of the application, especially for the offline and E2EE functionalities.
    *   **Affected Areas:** New `test/` directory, `package.json` (add test scripts).
    *   **Sub-tasks:**
        *   **Unit Tests:** We will use Jest to test individual functions and store actions (e.g., `e2ee.js` utilities, store `add/edit/delete` logic).
        *   **Integration Tests:** We will use React Testing Library to test component interactions and data flow within the UI.
        *   **End-to-End (E2E) Tests:** We will use Cypress (or Playwright) to simulate user flows, including offline scenarios and data persistence.

*   **Task 4.2: TypeScript Migration**
    *   **Description:** We will gradually migrate the JavaScript codebase to TypeScript to improve code quality, maintainability, and developer experience.
    *   **Affected Areas:** All `.js`/`.jsx` files in `src/`, `vite.config.js`, `package.json` (add TypeScript dependencies).
    *   **Sub-tasks:**
        *   We will configure TypeScript in the project (`tsconfig.json`).
        *   We will rename `.js` files to `.ts` and `.jsx` files to `.tsx`.
        *   We will add type definitions for existing code and external libraries.
        *   We will refactor components and stores to leverage TypeScript's features (interfaces, types).

---

### **Phase 5: Advanced Performance & Feature Enhancements**

**Objective:** To implement advanced performance optimizations and introduce new user-facing features.

*   **Task 5.1: Advanced Performance Optimization (List Virtualization)**
    *   **Description:** We will implement list virtualization for the Ideas, Thoughts, and Tasks pages to efficiently render large lists of items.
    *   **Affected Areas:** `src/pages/Thoughts.jsx`, `src/pages/Ideas.jsx`, `src/pages/Tasks.jsx`.
    *   **Sub-tasks:**
        *   We will integrate a virtualization library (e.g., `react-window`).
        *   We will refactor the rendering of lists to use virtualized components.

*   **Task 5.2: Rich Text Editing**
    *   **Description:** We will integrate a rich text editor to allow users to format their content beyond basic Markdown.
    *   **Affected Areas:** `src/pages/Thoughts.jsx`, `src/pages/Ideas.jsx`, `src/pages/Tasks.jsx`, new editor component.
    *   **Sub-tasks:**
        *   We will research and select a suitable rich text editor library (e.g., Quill, Slate, TipTap).
        *   We will integrate the editor into the input fields for thoughts, ideas, and tasks.
        *   We will ensure compatibility with E2EE (encrypting/decrypting the rich text content).

*   **Task 5.3: Tagging/Categorization**
    *   **Description:** We will allow users to add tags or categories to their thoughts, ideas, and tasks for better organization and filtering.
    *   **Affected Areas:** Supabase schema, `src/store/*Store.js`, `src/pages/*jsx` (UI for tags).
    *   **Sub-tasks:**
        *   We will update Supabase schema to include a `tags` or `categories` column (e.g., array of strings).
        *   We will modify store actions to handle adding/removing tags.
        *   We will implement UI for adding, displaying, and filtering by tags.

*   **Task 5.4: Reminders/Due Dates (for Tasks)**
    *   **Description:** We will add functionality for setting due dates and reminders for tasks.
    *   **Affected Areas:** Supabase schema, `src/store/useTasksStore.js`, `src/pages/Tasks.jsx`.
    *   **Sub-tasks:**
        *   We will update Supabase schema to include a `due_date` column.
        *   We will modify `useTasksStore` to handle due dates.
        *   We will implement UI for setting and displaying due dates.
        *   (Optional, more complex) We will integrate with browser notifications for reminders.
