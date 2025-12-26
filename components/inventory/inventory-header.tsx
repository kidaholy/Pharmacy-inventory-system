"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, Download } from "lucide-react"
import { AddMedicineDialog } from "./add-medicine-dialog"

interface InventoryHeaderProps {
  subdomain: string
  onMedicineAdded?: () => void
}

export function InventoryHeader({ subdomain, onMedicineAdded }: InventoryHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleMedicineAdded = () => {
    setIsAddDialogOpen(false)
    onMedicineAdded?.()
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your medicine stock and suppliers • Auto-save to MongoDB Atlas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search medicines..." className="pl-9" />
        </div>
        <Button variant="outline" className="sm:w-auto bg-transparent">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <AddMedicineDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        subdomain={subdomain}
        onMedicineAdded={handleMedicineAdded}
      />
    </>
  )
}
