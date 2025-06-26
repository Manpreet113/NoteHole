// AuthContext.jsx
// React context for managing authentication state and actions using Supabase
import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../components/supabaseClient";

const AuthContext = createContext();

// Provider component to wrap app and provide auth state and actions
export const AuthContextProvider = ({children}) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // Sign in with OAuth provider (Google, GitHub, etc.)
    const signInWithOAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: window.location.origin + "/login", // or your post-login route
        }
    });
    if (error) {
        console.error("OAuth error: ", error);
    }
};

    // Sign up a new user with email and password
    const signUpNewUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error("There was a problem signing you up: ", error)
    return { success: false, error }
  }

  return { success: true, data }
}

// Sign out the current user
const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("There was an error signing out:", error)
  }
}

    // Listen for auth state changes and update session
    useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setLoading(false);
    });

    return () => {
        listener.subscription.unsubscribe();
    };
}, []);

    // Sign in with email and password
    const signIn = async ({email, password}) => {
        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            })

            if(error){
                console.error("Sign-In error: ", error);
                return {success: false, error: error.message}
            }
            console.log("sign-in success: ", data);
            return {success: true, data};

        } catch (error) {
            console.error("Something went wrong: ", error)
        }
    }

    return(
        <AuthContext.Provider value={{ session, signUpNewUser, signIn, signOut, signInWithOAuth, loading  }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use auth context
export const UserAuth = () => {
    return useContext(AuthContext)
}