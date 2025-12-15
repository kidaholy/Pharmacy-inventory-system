import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, Clock, CheckCircle } from "lucide-react"

const stats = [
  {
    title: "Total Alerts",
    value: "142",
    icon: AlertCircle,
    color: "text-primary",
  },
  {
    title: "Critical",
    value: "8",
    icon: AlertTriangle,
    color: "text-destructive",
  },
  {
    title: "Pending",
    value: "34",
    icon: Clock,
    color: "text-warning",
  },
  {
    title: "Resolved",
    value: "100",
    icon: CheckCircle,
    color: "text-success",
  },
]

export function AlertsStats() {
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
