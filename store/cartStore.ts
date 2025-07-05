import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // ID del producto
  title: string;
  price: {
    amount: number;
    currencyCode: string;
  };
  featuredImage?: string;
  quantity: number;
}

interface CheckoutState {
  id: string | null;
  webUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  checkout: CheckoutState;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  proceedToCheckout: () => Promise<string | null>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      checkout: {
        id: null,
        webUrl: null,
        isLoading: false,
        error: null
      },
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.id === item.id);
        if (existingItem) {
          return {
            items: state.items.map((i) => 
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, quantity } : item
        ),
      })),
      clearCart: () => set({ 
        items: [],
        checkout: {
          id: null,
          webUrl: null,
          isLoading: false,
          error: null
        }
      }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price.amount * item.quantity), 0);
      },
      proceedToCheckout: async () => {
        const { items, checkout } = get();
        
        if (items.length === 0) {
          set({ 
            checkout: { 
              ...checkout, 
              error: "No hay productos en el carrito",
              isLoading: false 
            } 
          });
          return null;
        }

        set({ checkout: { ...checkout, isLoading: true, error: null } });

        try {
          console.log('Iniciando proceso de checkout con productos:', items);
          
          // Crear la orden en Jumpseller
          const response = await fetch('/api/jumpseller/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items }),
          });

          if (!response.ok) {
            throw new Error(`Error al crear la orden: ${response.statusText}`);
          }

          const orderData = await response.json();
          console.log('Orden creada correctamente:', orderData);
          
          set({ 
            checkout: { 
              id: orderData.order.id, 
              webUrl: orderData.order.checkout_url, 
              isLoading: false, 
              error: null 
            } 
          });
          
          // Limpiar el carrito después de crear la orden exitosamente
          get().clearCart();
          
          return orderData.order.checkout_url;
        } catch (error) {
          console.error('Error en proceedToCheckout:', error);
          set({ 
            checkout: { 
              ...checkout, 
              error: error instanceof Error ? error.message : "Falló el proceso de checkout", 
              isLoading: false 
            } 
          });
          return null;
        }
      },
    }),
    {
      name: 'cart-storage', // nombre para localStorage
      partialize: (state) => ({ items: state.items }), // solo guardar los items en localStorage
    }
  )
);