"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Eye, Edit, Mail, Phone } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  totalPurchases: number
  lastVisit: string
  loyaltyStatus: "none" | "member" | "premium"
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 234-567-8901",
    totalPurchases: 1245.5,
    lastVisit: "2025-01-10",
    loyaltyStatus: "premium",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 234-567-8902",
    totalPurchases: 890.25,
    lastVisit: "2025-01-12",
    loyaltyStatus: "member",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "m.brown@email.com",
    phone: "+1 234-567-8903",
    totalPurchases: 345.0,
    lastVisit: "2025-01-08",
    loyaltyStatus: "none",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "+1 234-567-8904",
    totalPurchases: 2150.75,
    lastVisit: "2025-01-14",
    loyaltyStatus: "premium",
  },
]

export function CustomersTable() {
  const [customers] = useState<Customer[]>(mockCustomers)

  const getLoyaltyBadge = (status: Customer["loyaltyStatus"]) => {
    switch (status) {
      case "premium":
        return <Badge className="bg-primary text-primary-foreground">Premium</Badge>
      case "member":
        return <Badge className="bg-accent text-accent-foreground">Member</Badge>
      case "none":
        return <Badge variant="outline">Regular</Badge>
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Customer List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Total Purchases</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{customer.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">${customer.totalPurchases.toFixed(2)}</TableCell>
                  <TableCell>{new Date(customer.lastVisit).toLocaleDateString()}</TableCell>
                  <TableCell>{getLoyaltyBadge(customer.loyaltyStatus)}</TableCell>
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
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
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
