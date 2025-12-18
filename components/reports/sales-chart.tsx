"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

const chartData = [
  { day: "Mon", sales: 2840 },
  { day: "Tue", sales: 3200 },
  { day: "Wed", sales: 2950 },
  { day: "Thu", sales: 3800 },
  { day: "Fri", sales: 4200 },
  { day: "Sat", sales: 3600 },
  { day: "Sun", sales: 2900 },
]

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
}

export function SalesChart() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Weekly Sales</CardTitle>
        <CardDescription>Sales performance for the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
