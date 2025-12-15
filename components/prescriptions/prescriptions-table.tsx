"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Eye, Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Prescription = {
  id: string
  patientName: string
  prescribedBy: string
  medicines: string[]
  date: string
  validUntil: string
  status: "active" | "completed" | "expired"
}

const mockPrescriptions: Prescription[] = [
  {
    id: "RX-001234",
    patientName: "John Smith",
    prescribedBy: "Dr. Sarah Williams",
    medicines: ["Amoxicillin 250mg", "Paracetamol 500mg"],
    date: "2025-01-10",
    validUntil: "2025-02-10",
    status: "active",
  },
  {
    id: "RX-001235",
    patientName: "Emily Davis",
    prescribedBy: "Dr. Michael Brown",
    medicines: ["Metformin 500mg"],
    date: "2025-01-12",
    validUntil: "2025-04-12",
    status: "active",
  },
  {
    id: "RX-001236",
    patientName: "Sarah Johnson",
    prescribedBy: "Dr. James Wilson",
    medicines: ["Omeprazole 20mg", "Ibuprofen 400mg"],
    date: "2025-01-08",
    validUntil: "2025-01-15",
    status: "completed",
  },
  {
    id: "RX-001237",
    patientName: "Michael Brown",
    prescribedBy: "Dr. Sarah Williams",
    medicines: ["Lisinopril 10mg"],
    date: "2024-12-20",
    validUntil: "2025-01-20",
    status: "expired",
  },
]

export function PrescriptionsTable() {
  const [prescriptions] = useState<Prescription[]>(mockPrescriptions)

  const getStatusBadge = (status: Prescription["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Prescription Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Prescribed By</TableHead>
                <TableHead>Medicines</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell className="font-medium">{prescription.id}</TableCell>
                  <TableCell>{prescription.patientName}</TableCell>
                  <TableCell className="text-muted-foreground">{prescription.prescribedBy}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {prescription.medicines.slice(0, 2).map((medicine, i) => (
                        <span key={i} className="text-sm">
                          {medicine}
                        </span>
                      ))}
                      {prescription.medicines.length > 2 && (
                        <span className="text-xs text-muted-foreground">+{prescription.medicines.length - 2} more</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(prescription.date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(prescription.validUntil).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
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
