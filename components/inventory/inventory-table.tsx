"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"

// Updated type to handle both old and new medicine structures
type Medicine = {
  _id: string
  name: string
  genericName?: string
  brandName?: string
  category: string
  batchNumber?: string
  batch?: string // Legacy field
  // New nested structure
  stock?: {
    current: number
    minimum: number
    available: number
  }
  pricing?: {
    sellingPrice: number
    costPrice: number
    mrp: number
  }
  dates?: {
    expiryDate: string
  }
  regulatory?: {
    prescriptionRequired: boolean
  }
  // Legacy flat structure
  quantity?: number
  price?: number
  expiryDate?: string
  prescriptionRequired?: boolean
  // Common fields
  manufacturer?: string
  supplier?: string
  isActive?: boolean
  createdAt: string
  updatedAt?: string
}

interface InventoryTableProps {
  subdomain: string
}

export function InventoryTable({ subdomain }: InventoryTableProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMedicines()
  }, [subdomain])

  const loadMedicines = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/tenant/${subdomain}/medicines`)
      const data = await response.json()
      
      if (data.success) {
        setMedicines(data.medicines)
      } else {
        setError(data.error || 'Failed to load medicines')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  // Helper functions to handle both old and new structures
  const getQuantity = (medicine: Medicine): number => {
    return medicine.stock?.current ?? medicine.quantity ?? 0
  }

  const getMinimumStock = (medicine: Medicine): number => {
    return medicine.stock?.minimum ?? 10
  }

  const getPrice = (medicine: Medicine): number => {
    return medicine.pricing?.sellingPrice ?? medicine.price ?? 0
  }

  const getExpiryDate = (medicine: Medicine): string => {
    return medicine.dates?.expiryDate ?? medicine.expiryDate ?? ''
  }

  const getBatchNumber = (medicine: Medicine): string => {
    return medicine.batchNumber ?? medicine.batch ?? 'N/A'
  }

  const getSupplier = (medicine: Medicine): string => {
    return medicine.supplier ?? 'Unknown'
  }

  const isPrescriptionRequired = (medicine: Medicine): boolean => {
    return medicine.regulatory?.prescriptionRequired ?? medicine.prescriptionRequired ?? false
  }

  const getStatus = (medicine: Medicine): "in-stock" | "low-stock" | "expiring" => {
    const quantity = getQuantity(medicine)
    const minimum = getMinimumStock(medicine)
    const expiryDate = new Date(getExpiryDate(medicine))
    const now = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(now.getDate() + 30)

    // Check if expiring soon (within 30 days)
    if (expiryDate <= thirtyDaysFromNow) {
      return "expiring"
    }
    
    // Check if low stock
    if (quantity <= minimum) {
      return "low-stock"
    }
    
    return "in-stock"
  }

  const getStatusBadge = (status: "in-stock" | "low-stock" | "expiring") => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>
      case "low-stock":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>
      case "expiring":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expiring Soon</Badge>
    }
  }

  const handleDelete = async (medicineId: string, medicineName: string) => {
    if (!confirm(`Are you sure you want to delete "${medicineName}"? This will immediately remove it from MongoDB Atlas.`)) {
      return
    }

    try {
      // Show immediate feedback by optimistically removing from UI
      const originalMedicines = [...medicines]
      setMedicines(prev => prev.filter(med => med._id !== medicineId))
      
      const response = await fetch(`/api/tenant/${subdomain}/medicines/${medicineId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Success - medicine already removed from UI
        console.log('✅ Medicine successfully deleted from MongoDB Atlas')
      } else {
        // Revert optimistic update on failure
        setMedicines(originalMedicines)
        setError(data.error || 'Failed to delete medicine')
      }
    } catch (err) {
      // Revert optimistic update on error
      setMedicines(medicines)
      setError('Failed to delete medicine')
    }
  }

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Medicine List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading medicines...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Medicine List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-red-600">{error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Medicine List ({medicines.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {medicines.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">No medicines found. Add your first medicine!</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Category</TableHead>
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
                {medicines.map((medicine) => {
                  const status = getStatus(medicine)
                  const expiryDate = getExpiryDate(medicine)
                  
                  return (
                    <TableRow key={medicine._id}>
                      <TableCell>
                        <div className="font-medium">{medicine.name}</div>
                        {medicine.genericName && (
                          <div className="text-sm text-muted-foreground">
                            Generic: {medicine.genericName}
                          </div>
                        )}
                        {isPrescriptionRequired(medicine) && (
                          <div className="text-xs text-red-600 font-medium">
                            ⚠️ Prescription Required
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{medicine.category}</TableCell>
                      <TableCell className="text-muted-foreground">{getBatchNumber(medicine)}</TableCell>
                      <TableCell className="text-right">
                        <div>{getQuantity(medicine)}</div>
                        <div className="text-xs text-muted-foreground">
                          Min: {getMinimumStock(medicine)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(getPrice(medicine))}</TableCell>
                      <TableCell>{getStatusBadge(status)}</TableCell>
                      <TableCell className="text-muted-foreground">{getSupplier(medicine)}</TableCell>
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
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(medicine._id, medicine.name)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
