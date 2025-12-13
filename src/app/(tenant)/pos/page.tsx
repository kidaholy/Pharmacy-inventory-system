import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Scan } from 'lucide-react';

export default function POSPage() {
  return (
    <div className="grid h-full grid-cols-3 gap-6">
      <div className="col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Product Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search or scan barcode..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Scan className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-24 flex-col gap-2"
                >
                  <span className="font-semibold">Product {i}</span>
                  <span className="text-sm text-muted-foreground">$10.00</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                Cart is empty
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>$0.00</span>
                </div>
              </div>

              <Button className="w-full" size="lg" disabled>
                Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}