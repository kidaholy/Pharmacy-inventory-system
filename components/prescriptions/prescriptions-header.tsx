"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { AddPrescriptionDialog } from "./add-prescription-dialog"

export function PrescriptionsHeader() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground mt-1">Track and manage customer prescriptions</p>
        </div>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Record Prescription
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by patient name or prescription ID..." className="pl-9" />
      </div>

      <AddPrescriptionDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  )
}
