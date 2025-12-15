"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductSearch } from "./product-search"
import { Cart } from "./cart"
import { PaymentDialog } from "./payment-dialog"

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  batch: string
}

export function POSInterface() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.batch === item.batch)
      if (existing) {
        return prev.map((i) => (i.id === item.id && i.batch === item.batch ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, batch: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, batch)
      return
    }
    setCartItems((prev) => prev.map((item) => (item.id === id && item.batch === batch ? { ...item, quantity } : item)))
  }

  const removeFromCart = (id: string, batch: string) => {
    setCartItems((prev) => prev.filter((item) => !(item.id === id && item.batch === batch)))
  }

  const clearCart = () => {
    setCartItems([])
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="flex flex-col gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Search Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductSearch onAddToCart={addToCart} />
          </CardContent>
        </Card>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <Cart
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onCheckout={() => setIsPaymentOpen(true)}
        />
      </div>

      <PaymentDialog
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        cartItems={cartItems}
        onComplete={clearCart}
      />
    </div>
  )
}
