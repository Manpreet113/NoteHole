"use client";

import { useEffect, useState } from "react";

type Sessionstatus = "loading" | "authenticated" | "unauthenticated";

const Mock_USER = { name: "John Doe", email: "john.doe@example.com" };

export const useSession = () => {
    const [ status, setStatus ] = useState<Sessionstatus>("loading");

    useEffect(() => {
        const timer = setTimeout(() => {
            setStatus("authenticated");
        }, 15000);

        return () => clearTimeout(timer);
    }, []);

    return{
        status,
        data: status === "authenticated" ? {user: Mock_USER} : null,
    };
};