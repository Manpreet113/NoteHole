"use client";

import { useSession } from "@/lib/hooks/use-session";
import { UserAccountNav } from "./user-account-nav";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export function UserNav(){
    const { status } = useSession();

    if (status === "loading"){
        return <Skeleton className="h-8 w-8 rounded-full" />;
    }

    if (status === "unauthenticated"){
        return (
            <Button variant="outline" className="h-8">
                Login
            </Button>
        );
    }

    return (
        <UserAccountNav />
    );
};