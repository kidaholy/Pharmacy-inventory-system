import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, ShoppingBag, CreditCard } from "lucide-react"

const stats = [
  {
    title: "Total Revenue",
    value: "$45,230.89",
    change: "+20.1% from last month",
    icon: DollarSign,
    positive: true,
  },
  {
    title: "Profit",
    value: "$12,450.50",
    change: "+18.5% from last month",
    icon: TrendingUp,
    positive: true,
  },
  {
    title: "Total Transactions",
    value: "1,245",
    change: "+12.3% from last month",
    icon: ShoppingBag,
    positive: true,
  },
  {
    title: "Avg. Transaction Value",
    value: "$36.30",
    change: "+5.2% from last month",
    icon: CreditCard,
    positive: true,
  },
]

export function RevenueStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs mt-1 ${stat.positive ? "text-success" : "text-destructive"}`}>{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
