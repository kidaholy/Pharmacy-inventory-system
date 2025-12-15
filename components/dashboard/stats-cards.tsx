import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, AlertCircle } from "lucide-react"

const stats = [
  {
    title: "Today's Sales",
    value: "$2,845.00",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Total Inventory",
    value: "1,284",
    change: "-3.2%",
    trend: "down",
    icon: Package,
  },
  {
    title: "Transactions",
    value: "156",
    change: "+8.1%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Low Stock Items",
    value: "23",
    change: "+5 new",
    trend: "alert",
    icon: AlertCircle,
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {stat.trend === "up" && (
                <>
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-success">{stat.change}</span>
                </>
              )}
              {stat.trend === "down" && (
                <>
                  <TrendingDown className="w-3 h-3 text-destructive" />
                  <span className="text-destructive">{stat.change}</span>
                </>
              )}
              {stat.trend === "alert" && <span className="text-warning">{stat.change}</span>}
              <span className="text-muted-foreground ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
