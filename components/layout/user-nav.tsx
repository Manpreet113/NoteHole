"use client";

import { useSession } from "@/lib/hooks/use-session";
import { UserAccountNav } from "./user-account-nav";
import { Skeleton } from "../ui/skeleton";
import { NavbarButton } from "../ui/nav";

export function UserNav(){
    const { status } = useSession();

    if (status === "loading"){
        return <Skeleton className="h-8 w-8 rounded-full" />;
    }

    if (status === "unauthenticated"){
        return (
            <NavbarButton variant="primary" className="h-8">
                Login
            </NavbarButton>
        );
    }

    return (
        <UserAccountNav />
    );
};