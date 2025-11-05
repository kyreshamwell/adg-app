'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Define the cart item type
export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  category: string;
}

// Define the context type
interface CartContextType {
  cart: CartItem[];
  addToCart: (service: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalDuration: () => number;
  getItemCount: () => number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Add item to cart
  const addToCart = (service: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...service,
      id: `${service.serviceId}-${Date.now()}`, // Unique ID for each cart item
    };
    setCart((prev) => [...prev, newItem]);
  };

  // Remove item from cart by ID
  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate total price
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  // Calculate total duration
  const getTotalDuration = () => {
    return cart.reduce((total, item) => total + item.duration, 0);
  };

  // Get number of items in cart
  const getItemCount = () => {
    return cart.length;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalDuration,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
