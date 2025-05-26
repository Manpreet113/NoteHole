import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../components/supabaseClient";

const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
    const [ session, setSession] = useState(undefined);

    const signUpNewUser = async () =>{
        const {data, error} = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if(error){
            console.error("There was a problem signing you up: ", error);
            return {success: false, error};
        }
        return {success: true, data};
    };

    useEffect(()=>{
        supabase.auth.getSession().then(({data: {session}})=>{
            setSession(session);
        });
        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, [])

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

    const signOut = () => {
        const {error} = supabase.auth.signOut
        if(error){
            console.error("There was an error: ", error)
        }
    }

    return(
        <AuthContext.Provider value={{ session, signUpNewUser, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}