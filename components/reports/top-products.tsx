import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type Product = {
  rank: number
  name: string
  category: string
  unitsSold: number
  revenue: number
  growth: number
}

const topProducts: Product[] = [
  {
    rank: 1,
    name: "Paracetamol 500mg",
    category: "OTC Medicine",
    unitsSold: 456,
    revenue: 2734.44,
    growth: 15.2,
  },
  {
    rank: 2,
    name: "Amoxicillin 250mg",
    category: "Prescription",
    unitsSold: 234,
    revenue: 2925.0,
    growth: 22.8,
  },
  {
    rank: 3,
    name: "Vitamin D3",
    category: "Supplements",
    unitsSold: 189,
    revenue: 1890.0,
    growth: 8.5,
  },
  {
    rank: 4,
    name: "Omeprazole 20mg",
    category: "Prescription",
    unitsSold: 167,
    revenue: 2671.33,
    growth: 18.3,
  },
  {
    rank: 5,
    name: "Ibuprofen 400mg",
    category: "OTC Medicine",
    unitsSold: 145,
    revenue: 1268.75,
    growth: -3.2,
  },
]

export function TopProducts() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Units Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product) => (
                <TableRow key={product.rank}>
                  <TableCell className="font-semibold">#{product.rank}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{product.unitsSold}</TableCell>
                  <TableCell className="text-right font-semibold">${product.revenue.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span className={product.growth >= 0 ? "text-success" : "text-destructive"}>
                      {product.growth >= 0 ? "+" : ""}
                      {product.growth}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
