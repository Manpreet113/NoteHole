// Callback.jsx
// Handles OAuth callback: finalizes login and redirects user after authentication
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/supabaseClient";
import useAuthStore from "../../store/useAuthStore";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    // Finalize OAuth login and set session
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
  }, []);

  return <div className="p-6">🔄 Logging you in via OAuth...</div>;
};

export default OAuthCallback;
