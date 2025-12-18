import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, AlertTriangle, DollarSign } from "lucide-react"

const stats = [
  {
    title: "Total Products",
    value: "1,284",
    icon: Package,
    color: "text-primary",
  },
  {
    title: "Low Stock Items",
    value: "23",
    icon: AlertTriangle,
    color: "text-warning",
  },
  {
    title: "Expiring Soon",
    value: "8",
    icon: TrendingUp,
    color: "text-destructive",
  },
  {
    title: "Total Value",
    value: "ETB 248,560",
    icon: DollarSign,
    color: "text-success",
  },
]

export function InventoryStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
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
