import Link from "next/link";
import { HeaderNav } from "./header-nav";

export function SiteHeader(){
    return(
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 background-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container px-3 flex h-14 max-w-screen-2xl items-center">
                {/* Site Branding */}
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    {/* Add SVG logo when we have one */}
                    <span className="font-bold">NoteHole</span>
                </Link>
                <HeaderNav />
            </div>
        </header>
    )
}