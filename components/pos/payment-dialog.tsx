"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Wallet, DollarSign, Loader2, CheckCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { CartItem } from "./pos-interface"

type PaymentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  cartItems: CartItem[]
  onComplete: () => void
}

export function PaymentDialog({ open, onOpenChange, cartItems, onComplete }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [amountPaid, setAmountPaid] = useState("")

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax
  const change = Number.parseFloat(amountPaid) - total

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)

      // Close dialog and reset after showing success
      setTimeout(() => {
        onComplete()
        onOpenChange(false)
        setIsComplete(false)
        setAmountPaid("")
        setPaymentMethod("cash")
      }, 2000)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {!isComplete ? (
          <>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>Select payment method and complete the transaction</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleComplete}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                        <DollarSign className="w-4 h-4" />
                        Cash
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="w-4 h-4" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="digital" id="digital" />
                      <Label htmlFor="digital" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Wallet className="w-4 h-4" />
                        Digital Wallet
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentMethod === "cash" && (
                  <div className="space-y-2">
                    <Label htmlFor="amountPaid">Amount Paid</Label>
                    <Input
                      id="amountPaid"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      required
                    />
                    {Number.parseFloat(amountPaid) > total && (
                      <p className="text-sm text-success">Change: {formatCurrency(change)}</p>
                    )}
                  </div>
                )}

                <Separator />

                <div className="space-y-2 bg-secondary/30 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing || (paymentMethod === "cash" && Number.parseFloat(amountPaid) < total)}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Complete Payment"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="py-12 text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground">Transaction completed successfully</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
