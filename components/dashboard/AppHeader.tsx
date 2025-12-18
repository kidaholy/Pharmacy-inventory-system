"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

export function AppHeader() {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/50 backdrop-blur-md px-4 sticky top-0 z-10 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="hidden md:block">
                    {/* Breadcrumb could go here */}
                    <h2 className="text-sm font-semibold text-foreground/80">Pharmacy Management</h2>
                </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Bell className="h-4 w-4" />
                </Button>
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    AD
                </div>
            </div>
        </header>
    )
}
