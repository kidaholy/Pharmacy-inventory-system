import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"

const stats = [
  {
    title: "Total Prescriptions",
    value: "1,245",
    icon: FileText,
  },
  {
    title: "Pending",
    value: "34",
    icon: Clock,
  },
  {
    title: "Completed Today",
    value: "89",
    icon: CheckCircle,
  },
  {
    title: "Expiring Soon",
    value: "12",
    icon: AlertCircle,
  },
]

export function PrescriptionsStats() {
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
