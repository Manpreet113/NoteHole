import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/supabaseClient";
import useAuthStore from "../../store/useAuthStore"; // or your Zustand store

const OAuthCallback = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
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
