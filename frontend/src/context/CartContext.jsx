import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/supabaseClient';
import { endpoints } from '../api/supabase';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await endpoints.cart.get();
      setCart(data.data);
    } catch (_) {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    const { data: listener } = supabase.auth.onAuthStateChange(() => fetchCart());
    return () => listener.subscription.unsubscribe();
  }, [fetchCart]);

  const addToCart = async (productId, color = '', price) => {
    const { data } = await endpoints.cart.add({ productId, color, price });
    setCart(data.data);
    return data;
  };

  const updateQuantity = async (itemId, quantity) => {
    const { data } = await endpoints.cart.updateItem(itemId, { quantity });
    setCart(data.data);
    return data;
  };

  const removeItem = async (itemId) => {
    const { data } = await endpoints.cart.removeItem(itemId);
    setCart(data.data);
    return data;
  };

  const clearCart = async () => {
    await endpoints.cart.clear();
    setCart(null);
  };

  const applyCoupon = async (coupon) => {
    const { data } = await endpoints.cart.applyCoupon(coupon);
    setCart(data.data);
    return data;
  };

  const cartCount = cart?.cartItems?.length ?? 0;
  const cartTotal = cart?.totalPriceAfterDiscount ?? cart?.totalCartPrice ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
