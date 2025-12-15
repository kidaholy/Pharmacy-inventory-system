"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Package, AlertCircle, TrendingDown, FileText, X, Check } from "lucide-react"

type Alert = {
  id: string
  type: "expiry" | "stock" | "system" | "prescription"
  title: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  timestamp: string
  isRead: boolean
  icon: typeof Clock
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "expiry",
    title: "Medicine Expiring Soon",
    description: "Paracetamol 500mg (Batch: PT2024001) - 15 units expire in 7 days",
    severity: "high",
    timestamp: "2 hours ago",
    isRead: false,
    icon: Clock,
  },
  {
    id: "2",
    type: "stock",
    title: "Critical Low Stock",
    description: "Amoxicillin 250mg - Only 5 units remaining",
    severity: "critical",
    timestamp: "3 hours ago",
    isRead: false,
    icon: TrendingDown,
  },
  {
    id: "3",
    type: "prescription",
    title: "Prescription Expiring",
    description: "Prescription RX-001237 for Michael Brown expires in 2 days",
    severity: "medium",
    timestamp: "5 hours ago",
    isRead: false,
    icon: FileText,
  },
  {
    id: "4",
    type: "stock",
    title: "Low Stock Alert",
    description: "Metformin 500mg - Stock below minimum threshold (45 units)",
    severity: "medium",
    timestamp: "1 day ago",
    isRead: true,
    icon: Package,
  },
  {
    id: "5",
    type: "system",
    title: "Monthly Report Ready",
    description: "Your monthly sales and inventory report is ready for review",
    severity: "low",
    timestamp: "1 day ago",
    isRead: true,
    icon: AlertCircle,
  },
  {
    id: "6",
    type: "expiry",
    title: "Medicine Expired",
    description: "Ibuprofen 400mg (Batch: IB2023099) has expired - Remove from inventory",
    severity: "critical",
    timestamp: "2 days ago",
    isRead: false,
    icon: Clock,
  },
]

export function AlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts)

  const markAsRead = (id: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, isRead: true } : alert)))
  }

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "high":
        return "bg-warning/10 text-warning border-warning/20"
      case "medium":
        return "bg-primary/10 text-primary border-primary/20"
      case "low":
        return "bg-accent/10 text-accent-foreground border-accent/20"
    }
  }

  const renderAlerts = (filterType?: string, filterRead?: boolean) => {
    let filtered = alerts

    if (filterType) {
      filtered = filtered.filter((alert) => alert.type === filterType)
    }

    if (filterRead !== undefined) {
      filtered = filtered.filter((alert) => alert.isRead === filterRead)
    }

    if (filtered.length === 0) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No alerts to display</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
              alert.isRead ? "bg-card" : "bg-secondary/50"
            }`}
          >
            <div className={`p-2.5 rounded-lg ${getSeverityColor(alert.severity)}`}>
              <alert.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <Badge
                    variant={alert.severity === "critical" || alert.severity === "high" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {alert.severity}
                  </Badge>
                  {!alert.isRead && (
                    <Badge variant="outline" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                <div className="flex items-center gap-2">
                  {!alert.isRead && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markAsRead(alert.id)}>
                      <Check className="w-3 h-3 mr-1" />
                      Mark Read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">All Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="expiry">Expiry</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            {renderAlerts()}
          </TabsContent>
          <TabsContent value="unread" className="mt-4">
            {renderAlerts(undefined, false)}
          </TabsContent>
          <TabsContent value="expiry" className="mt-4">
            {renderAlerts("expiry")}
          </TabsContent>
          <TabsContent value="stock" className="mt-4">
            {renderAlerts("stock")}
          </TabsContent>
          <TabsContent value="system" className="mt-4">
            {renderAlerts("system")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
