"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/useCart';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCart();

  // Redirect to the contact information page
  useEffect(() => {
    if (items.length > 0) {
      router.push('/checkout/contact');
    }
  }, [items, router]);

  // If there are no items, show empty cart message
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <ShoppingCart size={48} className="text-muted-foreground mb-4" />
            <h1 className="text-xl font-bold mb-2">Tu carrito está vacío</h1>
            <p className="text-muted-foreground mb-6">Agrega productos para continuar con la compra</p>
            <Button 
              onClick={() => router.push('/')}
              className="w-full md:w-auto"
            >
              Volver a la tienda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full size-12 border-y-2 border-primary"></div>
      <p className="mt-4 text-muted-foreground">Cargando proceso de checkout...</p>
    </div>
  );
}