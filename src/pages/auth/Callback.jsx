// import { useState } from "react";
// Callback.jsx
// Handles OAuth callback: finalizes login and redirects user after authentication
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/supabaseClient";
import useAuthStore from "../../store/useAuthStore"; // or your Zustand store

const OAuthCallback = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  // Password reset (recovery) state
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  useEffect(() => {
    // Debug current URL
    console.log('Callback.jsx - Current URL:', window.location.href);
    console.log('Callback.jsx - Search params:', window.location.search);
    console.log('Callback.jsx - Hash:', window.location.hash);
    
    // Always prioritize password recovery if present
    const url = new URL(window.location.href);
    let type = url.searchParams.get('type');
    if (!type && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      type = hashParams.get('type');
      console.log('Callback.jsx - Type from hash:', type);
    }
    console.log('Callback.jsx - Type from search:', url.searchParams.get('type'));
    console.log('Callback.jsx - Final type value:', type);
    
    if (type === 'recovery') {
      console.log('Recovery flow detected, setting isRecovery to true');
      setIsRecovery(true);
      // Explicitly return - no other logic should run
      return;
    } else {
      console.log('No recovery type found, proceeding with OAuth login flow');
      // Only run login/session logic if not recovery
      const finalizeLogin = async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          console.error("OAuth login failed", error);
          navigate("/login?error=1");
          return;
        }
        setSession(data.session);
        navigate("/thoughts"); // Redirect to the main app page
      };
      finalizeLogin();
    }
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    if (!newPassword || newPassword.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setResetError(error.message);
    } else {
      setResetSuccess("Password updated! You can now log in with your new password.");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  if (isRecovery) {
    return (
      <main className="w-full h-screen flex flex-col items-center justify-center px-2 sm:px-4">
        <div className="max-w-xs sm:max-w-sm w-full border p-4 sm:p-10 rounded-3xl text-gray-600 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold">Set a new password</h1>
            <p className="text-sm text-gray-500 mt-2">Enter your new password below.</p>
          </div>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="New password"
            />
            <button type="submit" className="btn btn-primary w-full mt-2">Update Password</button>
          </form>
          {resetError && <p className="text-red-500 text-sm text-center">{resetError}</p>}
          {resetSuccess && <p className="text-green-600 text-sm text-center">{resetSuccess}</p>}
        </div>
      </main>
    );
  }

  return <div className="p-6">🔄 Logging you in via OAuth...</div>;
};

export default OAuthCallback;
