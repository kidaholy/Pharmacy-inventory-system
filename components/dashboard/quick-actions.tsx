import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ShoppingCart, FileText, Package } from "lucide-react"

const actions = [
  {
    title: "New Sale",
    description: "Start POS transaction",
    icon: ShoppingCart,
    href: "/dashboard/pos",
  },
  {
    title: "Add Medicine",
    description: "Add to inventory",
    icon: Plus,
    href: "/dashboard/inventory",
  },
  {
    title: "Record Prescription",
    description: "Add new prescription",
    icon: FileText,
    href: "/dashboard/prescriptions",
  },
  {
    title: "Stock Check",
    description: "View inventory status",
    icon: Package,
    href: "/dashboard/inventory",
  },
]

export function QuickActions() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="outline"
                className="w-full h-auto flex flex-col items-start gap-2 p-4 hover:bg-secondary hover:border-primary/50 transition-colors bg-transparent"
              >
                <action.icon className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
