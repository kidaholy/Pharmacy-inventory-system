"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"

type Medicine = {
  id: string
  name: string
  batch: string
  quantity: number
  expiryDate: string
  price: number
  status: "in-stock" | "low-stock" | "expiring"
  supplier: string
}

const mockMedicines: Medicine[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    batch: "PT2024001",
    quantity: 500,
    expiryDate: "2025-12-31",
    price: 5.99,
    status: "in-stock",
    supplier: "PharmaCorp",
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    batch: "AM2024002",
    quantity: 5,
    expiryDate: "2025-08-15",
    price: 12.5,
    status: "low-stock",
    supplier: "MediSupply",
  },
  {
    id: "3",
    name: "Ibuprofen 400mg",
    batch: "IB2024003",
    quantity: 250,
    expiryDate: "2025-03-20",
    price: 8.75,
    status: "expiring",
    supplier: "PharmaCorp",
  },
  {
    id: "4",
    name: "Omeprazole 20mg",
    batch: "OM2024004",
    quantity: 150,
    expiryDate: "2026-01-10",
    price: 15.99,
    status: "in-stock",
    supplier: "HealthPlus",
  },
  {
    id: "5",
    name: "Metformin 500mg",
    batch: "MT2024005",
    quantity: 300,
    expiryDate: "2025-11-25",
    price: 9.5,
    status: "in-stock",
    supplier: "MediSupply",
  },
]

export function InventoryTable() {
  const [medicines] = useState<Medicine[]>(mockMedicines)

  const getStatusBadge = (status: Medicine["status"]) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-success text-success-foreground">In Stock</Badge>
      case "low-stock":
        return <Badge className="bg-warning text-warning-foreground">Low Stock</Badge>
      case "expiring":
        return <Badge variant="destructive">Expiring Soon</Badge>
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Medicine List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine Name</TableHead>
                <TableHead>Batch No.</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicines.map((medicine) => (
                <TableRow key={medicine.id}>
                  <TableCell className="font-medium">{medicine.name}</TableCell>
                  <TableCell className="text-muted-foreground">{medicine.batch}</TableCell>
                  <TableCell className="text-right">{medicine.quantity}</TableCell>
                  <TableCell>{new Date(medicine.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(medicine.price)}</TableCell>
                  <TableCell>{getStatusBadge(medicine.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{medicine.supplier}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
