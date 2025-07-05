"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/useCart';
import { ShoppingCart } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-100">
        <ShoppingCart size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h1 className="text-xl font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Agrega productos para continuar con la compra</p>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando proceso de checkout...</p>
    </div>
  );
}