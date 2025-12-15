import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    type: "sale",
    description: "Sale #1234 completed",
    amount: "$45.50",
    time: "10 minutes ago",
    user: "John Doe",
  },
  {
    id: 2,
    type: "inventory",
    description: "Added 50 units of Ibuprofen 400mg",
    time: "1 hour ago",
    user: "Jane Smith",
  },
  {
    id: 3,
    type: "prescription",
    description: "Prescription recorded for Patient #5678",
    time: "2 hours ago",
    user: "John Doe",
  },
  {
    id: 4,
    type: "sale",
    description: "Sale #1233 completed",
    amount: "$127.80",
    time: "3 hours ago",
    user: "Jane Smith",
  },
]

export function RecentActivity() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activity.user} • {activity.time}
                </p>
              </div>
              {activity.amount && <div className="text-sm font-semibold text-primary">{activity.amount}</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
