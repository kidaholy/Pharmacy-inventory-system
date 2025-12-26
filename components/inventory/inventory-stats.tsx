"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, AlertTriangle, DollarSign } from "lucide-react"

interface InventoryStatsProps {
  subdomain: string
}

interface StatsData {
  totalProducts: number
  lowStockItems: number
  expiringSoon: number
  totalValue: number
}

export function InventoryStats({ subdomain }: InventoryStatsProps) {
  const [stats, setStats] = useState<StatsData>({
    totalProducts: 0,
    lowStockItems: 0,
    expiringSoon: 0,
    totalValue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [subdomain])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Load all medicines to calculate stats
      const response = await fetch(`/api/tenant/${subdomain}/medicines`)
      const data = await response.json()
      
      if (data.success) {
        const medicines = data.medicines
        
        // Calculate stats
        const totalProducts = medicines.length
        let lowStockItems = 0
        let expiringSoon = 0
        let totalValue = 0
        
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        
        medicines.forEach((medicine: any) => {
          // Handle both old and new structure
          const quantity = medicine.stock?.current ?? medicine.quantity ?? 0
          const minimum = medicine.stock?.minimum ?? 10
          const price = medicine.pricing?.sellingPrice ?? medicine.price ?? 0
          const expiryDate = new Date(medicine.dates?.expiryDate ?? medicine.expiryDate ?? '')
          
          // Check low stock
          if (quantity <= minimum) {
            lowStockItems++
          }
          
          // Check expiring soon
          if (expiryDate <= thirtyDaysFromNow) {
            expiringSoon++
          }
          
          // Calculate total value
          totalValue += quantity * price
        })
        
        setStats({
          totalProducts,
          lowStockItems,
          expiringSoon,
          totalValue
        })
      }
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const statsConfig = [
    {
      title: "Total Products",
      value: loading ? "..." : stats.totalProducts.toString(),
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Low Stock Items",
      value: loading ? "..." : stats.lowStockItems.toString(),
      icon: AlertTriangle,
      color: stats.lowStockItems > 0 ? "text-yellow-600" : "text-green-600",
    },
    {
      title: "Expiring Soon",
      value: loading ? "..." : stats.expiringSoon.toString(),
      icon: TrendingUp,
      color: stats.expiringSoon > 0 ? "text-red-600" : "text-green-600",
    },
    {
      title: "Total Value",
      value: loading ? "..." : formatCurrency(stats.totalValue),
      icon: DollarSign,
      color: "text-green-600",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat) => (
        <Card key={stat.title} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
