"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { category: "Prescription", value: 12450, fill: "hsl(var(--chart-1))" },
  { category: "OTC Medicines", value: 8230, fill: "hsl(var(--chart-2))" },
  { category: "Supplements", value: 5680, fill: "hsl(var(--chart-3))" },
  { category: "Medical Devices", value: 3240, fill: "hsl(var(--chart-4))" },
  { category: "Others", value: 2100, fill: "hsl(var(--chart-5))" },
]

const chartConfig = {
  value: {
    label: "Sales",
  },
}

export function SalesBreakdown() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Sales by Category</CardTitle>
        <CardDescription>Distribution of sales across product categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
