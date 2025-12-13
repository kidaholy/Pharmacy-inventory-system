import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, AlertTriangle, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your pharmacy operations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,450.00</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Within next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              Across all products
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">INV-001</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
                <p className="text-sm font-medium">$125.00</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">INV-002</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
                <p className="text-sm font-medium">$89.50</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">INV-003</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
                <p className="text-sm font-medium">$234.75</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Paracetamol 500mg</p>
                  <p className="text-xs text-muted-foreground">Only 15 units left</p>
                </div>
                <span className="text-xs font-medium text-orange-600">Low</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Amoxicillin 250mg</p>
                  <p className="text-xs text-muted-foreground">Only 8 units left</p>
                </div>
                <span className="text-xs font-medium text-red-600">Critical</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Ibuprofen 400mg</p>
                  <p className="text-xs text-muted-foreground">Only 20 units left</p>
                </div>
                <span className="text-xs font-medium text-orange-600">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}