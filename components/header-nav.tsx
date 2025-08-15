"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "./user-nav";

export function HeaderNav(){
    return(
        <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
                <ThemeToggle />
                <UserNav />
            </nav>
        </div>
    );
}