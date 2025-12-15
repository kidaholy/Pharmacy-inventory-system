"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Settings, CheckCheck } from "lucide-react"

export function AlertsHeader() {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts & Notifications</h1>
          <p className="text-muted-foreground mt-1">Manage system alerts and notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search alerts..." className="pl-9" />
      </div>
    </>
  )
}
