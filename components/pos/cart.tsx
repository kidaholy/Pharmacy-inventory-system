"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react"
import type { CartItem } from "./pos-interface"

type CartProps = {
  items: CartItem[]
  onUpdateQuantity: (id: string, batch: string, quantity: number) => void
  onRemoveItem: (id: string, batch: string) => void
  onClearCart: () => void
  onCheckout: () => void
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onClearCart, onCheckout }: CartProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Cart ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.batch}`}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Batch: {item.batch}</p>
                  <p className="text-sm font-semibold mt-2">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRemoveItem(item.id, item.batch)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 bg-transparent"
                      onClick={() => onUpdateQuantity(item.id, item.batch, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(item.id, item.batch, Number.parseInt(e.target.value) || 1)}
                      className="w-14 h-7 text-center"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 bg-transparent"
                      onClick={() => onUpdateQuantity(item.id, item.batch, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {items.length > 0 && (
        <CardFooter className="flex flex-col gap-3">
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={onCheckout}>
            Proceed to Payment
          </Button>
          <Button variant="outline" className="w-full bg-transparent" onClick={onClearCart}>
            Clear Cart
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
