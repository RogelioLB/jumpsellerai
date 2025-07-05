'use client';

import { useCart } from '@/store/useCart';
import { useCartSidebar } from '@/store/useCartSidebar';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from './ui/separator';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function CartSidebar() {
  const router = useRouter();
  const { isOpen, close } = useCartSidebar();
  const { items, removeItem, updateQuantity } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Controlar la animación de entrada y salida
  useEffect(() => {
    if (isOpen) {
      // Primero activamos la animación
      setIsAnimating(true);
      // Pequeño retraso para que se vea la animación de entrada
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      // Al cerrar, primero ocultamos visualmente
      setIsVisible(false);
      // Luego esperamos a que termine la animación antes de remover del DOM
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Duración de la animación
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Calculate total
  const total = items.reduce((acc, item) => {
    return acc + (item.price.amount * (item.quantity || 1));
  }, 0);

  // Format price
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const handleIncrement = (item: any) => {
    updateQuantity(item.id, (item.quantity || 1) + 1);
  };

  const handleDecrement = (item: any) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeItem(item.id);
    }
  };

  if (!isOpen && !isAnimating) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={close}
      />
      
      {/* Cart Sidebar */}
      <div 
        className={cn(
          "absolute top-0 right-0 size-full sm:w-96 md:w-[30rem] bg-background border-l shadow-xl overflow-auto flex flex-col transition-transform duration-300 ease-out",
          isVisible ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Carrito de Compras</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <ShoppingBag className="mr-1.5 size-4" />
                <span className="text-sm font-medium">{items.length} items</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="size-8 rounded-full" 
                onClick={close}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <ShoppingBag className="size-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">Tu carrito está vacío</h3>
              <p className="text-muted-foreground mt-2">
                Agrega productos al carrito para verlos aquí
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative size-20 rounded-md overflow-hidden bg-gray-100 shrink-0">
                      <Image
                        src={item.featuredImage || '/placeholder.jpg'}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between">
                        <h3 className="font-medium line-clamp-2 text-sm">{item.title}</h3>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-6 rounded-full" 
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      
                      <div className="mt-auto flex justify-between items-center">
                        <p className="text-sm font-medium">
                          {formatPrice(item.price.amount)}
                        </p>
                        
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="size-6 rounded-full" 
                            onClick={() => handleDecrement(item)}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="mx-2 text-sm w-4 text-center">
                            {item.quantity || 1}
                          </span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="size-6 rounded-full" 
                            onClick={() => handleIncrement(item)}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-background sticky bottom-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-xs italic">Se calcula al pagar</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Button 
                className="w-full"
                onClick={() => {
                  close();
                  router.push('/checkout');
                }}
                disabled={items.length === 0}
              >
                Proceder al pago
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={close}
              >
                Seguir comprando
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
