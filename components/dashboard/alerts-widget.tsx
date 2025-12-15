import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, TrendingDown } from "lucide-react"

const alerts = [
  {
    id: 1,
    type: "expiry",
    title: "Paracetamol 500mg expiring soon",
    description: "15 units expire in 7 days",
    severity: "high",
    icon: Clock,
  },
  {
    id: 2,
    type: "stock",
    title: "Low stock alert",
    description: "Amoxicillin 250mg - Only 5 units left",
    severity: "medium",
    icon: TrendingDown,
  },
  {
    id: 3,
    type: "system",
    title: "System notification",
    description: "Monthly report is ready for review",
    severity: "low",
    icon: AlertCircle,
  },
]

export function AlertsWidget() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card hover:bg-secondary/50 transition-colors"
            >
              <div
                className={`p-2 rounded-lg ${
                  alert.severity === "high"
                    ? "bg-destructive/10 text-destructive"
                    : alert.severity === "medium"
                      ? "bg-warning/10 text-warning"
                      : "bg-primary/10 text-primary"
                }`}
              >
                <alert.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <Badge variant={alert.severity === "high" ? "destructive" : "secondary"} className="text-xs">
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
