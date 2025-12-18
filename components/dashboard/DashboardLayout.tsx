"use client"

import * as React from "react"
import { AppSidebar } from "./AppSidebar"
import { AppHeader } from "./AppHeader"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <AppHeader />
                <div className="flex-1 space-y-4 p-8 pt-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
