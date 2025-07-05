import { useCartStore } from './cartStore';

// This is a custom hook that provides access to the cart store
export const useCart = () => {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  } = useCartStore();

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };
};
