"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { CartItem } from "./pos-interface"

type Product = {
  id: string
  name: string
  price: number
  batch: string
  stock: number
}

const mockProducts: Product[] = [
  { id: "1", name: "Paracetamol 500mg", price: 5.99, batch: "PT2024001", stock: 500 },
  { id: "2", name: "Amoxicillin 250mg", price: 12.5, batch: "AM2024002", stock: 5 },
  { id: "3", name: "Ibuprofen 400mg", price: 8.75, batch: "IB2024003", stock: 250 },
  { id: "4", name: "Omeprazole 20mg", price: 15.99, batch: "OM2024004", stock: 150 },
  { id: "5", name: "Metformin 500mg", price: 9.5, batch: "MT2024005", stock: 300 },
]

type ProductSearchProps = {
  onAddToCart: (item: Omit<CartItem, "quantity">) => void
}

export function ProductSearch({ onAddToCart }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const results = mockProducts.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    setSearchResults(results)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by medicine name or batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{searchResults.length} results found</p>
          <div className="grid gap-2 max-h-[400px] overflow-y-auto">
            {searchResults.map((product) => (
              <div
                key={`${product.id}-${product.batch}`}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{product.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-muted-foreground">Batch: {product.batch}</p>
                    <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold">{formatCurrency(product.price)}</p>
                  <Button
                    size="sm"
                    onClick={() =>
                      onAddToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        batch: product.batch,
                      })
                    }
                    disabled={product.stock === 0}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
