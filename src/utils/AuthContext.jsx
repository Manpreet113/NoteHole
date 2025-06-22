import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../components/supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

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

const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("There was an error signing out:", error)
  }
}

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

export const UserAuth = () => {
    return useContext(AuthContext)
}