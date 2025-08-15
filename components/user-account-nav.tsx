"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function UserAccountNav(){
    const user = { name : "john doe", image: null };

    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image ?? ""} alt={user.name ?? "User Avatar" } />
                        <AvatarFallback>
                            {user.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            {/* Add DropdownMenuContent here */}
        </DropdownMenu>
    );
};