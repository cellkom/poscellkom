import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image_url?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product) => {
    if (!user) {
      toast.info("Silakan login atau daftar untuk melanjutkan belanja.");
      navigate('/member-login', { state: { from: location.pathname } });
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          toast.success(`${product.name} ditambahkan ke keranjang!`);
          return prevItems.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          toast.warning(`Stok untuk ${product.name} tidak mencukupi.`);
          return prevItems;
        }
      } else {
        if (product.stock > 0) {
          toast.success(`${product.name} ditambahkan ke keranjang!`);
          return [...prevItems, { ...product, quantity: 1 }];
        } else {
          toast.error(`${product.name} sedang habis.`);
          return prevItems;
        }
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast.info("Produk telah dihapus dari keranjang.");
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId) {
          if (quantity > 0 && quantity <= item.stock) {
            return { ...item, quantity };
          } else if (quantity > item.stock) {
            toast.warning(`Stok untuk ${item.name} hanya tersisa ${item.stock}.`);
            return { ...item, quantity: item.stock };
          }
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};