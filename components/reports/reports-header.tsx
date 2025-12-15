"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Download, FileText } from "lucide-react"

export function ReportsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">View insights and generate reports</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Date Range
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
        <Button size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>
    </div>
  )
}
