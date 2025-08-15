"use client";

import { useEffect, useState } from "react";

type Sessionstatus = "loading" | "authenticated" | "unauthenticated";

const Mock_USER = { name: "John Wick", email: "john.wick@example.com" };

export const useSession = () => {
    const [ status, setStatus ] = useState<Sessionstatus>("loading");

    useEffect(() => {
        const timer = setTimeout(() => {
            setStatus("authenticated");
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return{
        status,
        data: status === "authenticated" ? {user: Mock_USER} : null,
    };
};