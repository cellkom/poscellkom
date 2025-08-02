import React from 'react';
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { format } from 'date-fns';
import { ShoppingCart, Minus, Plus, Trash2, XCircle } from "lucide-react";
import { Link } from 'react-router-dom';

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const CartSidebar = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.retailPrice * item.quantity), 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" /> Keranjang Belanja ({cartItems.length})
        </h3>
        <SheetClose asChild>
          <Button variant="ghost" size="icon">
            <XCircle className="h-5 w-5" />
            <span className="sr-only">Tutup</span>
          </Button>
        </SheetClose>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {cartItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-lg">Keranjang Anda kosong.</p>
            <p className="text-sm">Tambahkan produk untuk memulai belanja.</p>
            <SheetClose asChild>
              <Button asChild className="mt-4">
                <Link to="/products">Lihat Produk</Link>
              </Button>
            </SheetClose>
          </div>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="flex items-center gap-3 border-b pb-3 last:border-b-0">
              <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                )}
              </div>
              <div className="flex-grow">
                <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(item.retailPrice)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => removeFromCart(item.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="p-4 border-t space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Subtotal:</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(subtotal)}</span>
          </div>
          <Button className="w-full" size="lg">
            Lanjutkan ke Pembayaran
          </Button>
          <Button variant="outline" className="w-full" onClick={clearCart}>
            Bersihkan Keranjang
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartSidebar;