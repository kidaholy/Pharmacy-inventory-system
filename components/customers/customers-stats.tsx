import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, ShoppingBag, Star } from "lucide-react"

const stats = [
  {
    title: "Total Customers",
    value: "486",
    icon: Users,
  },
  {
    title: "Active This Month",
    value: "234",
    icon: UserCheck,
  },
  {
    title: "Avg. Purchases",
    value: "8.2",
    icon: ShoppingBag,
  },
  {
    title: "Loyalty Members",
    value: "156",
    icon: Star,
  },
]

export function CustomersStats() {
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
