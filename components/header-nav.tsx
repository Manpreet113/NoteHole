"use client";

import * as React from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function HeaderNav(){
    return(
        <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
                <ThemeToggle />
                <Button variant="outline">Login</Button>
            </nav>
        </div>
    );
}