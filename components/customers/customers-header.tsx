"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { AddCustomerDialog } from "./add-customer-dialog"

export function CustomersHeader() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage customer profiles and purchase history</p>
        </div>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search customers by name, phone, or email..." className="pl-9" />
      </div>

      <AddCustomerDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  )
}
