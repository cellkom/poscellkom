import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Barcode from '@/components/Barcode';

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface ReceiptProps {
  transaction: {
    id: string;
    items: Array<{
      name: string;
      quantity: number;
      priceType: 'retail' | 'reseller';
      retailPrice: number;
      resellerPrice: number;
    }>;
    summary: {
      totalSale: number;
    };
    customerName: string;
    paymentMethod: string;
    date: Date;
    paymentAmount: number;
    change: number;
    remainingAmount: number;
  };
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ transaction }, ref) => {
  if (!transaction) return null;

  const { id: transactionId, items, summary, customerName, paymentMethod, date, paymentAmount, change, remainingAmount } = transaction;

  return (
    <div ref={ref} id="receipt-print-area" className="bg-white text-black p-4 font-mono max-w-sm mx-auto border rounded-lg">
      <div className="text-center">
        <h2 className="text-xl font-bold">CELLKOM</h2>
        <p className="text-xs">Service & Toko Handphone</p>
        <p className="text-xs">Jl. Merdeka No. 123, Kota Anda</p>
        <p className="text-xs">Telp: 0812-3456-7890</p>
      </div>

      <div className="border-t border-b border-dashed border-black my-2 py-1 text-xs">
        <div className="flex justify-between">
          <span>No: {transactionId}</span>
          <span>{format(date, 'dd/MM/yy HH:mm')}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir: admin</span>
          <span>Pelanggan: {customerName}</span>
        </div>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left font-normal">Barang</th>
            <th className="text-right font-normal">Jml</th>
            <th className="text-right font-normal">Harga</th>
            <th className="text-right font-normal">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const price = item.priceType === 'retail' ? item.retailPrice : item.resellerPrice;
            return (
              <tr key={index}>
                <td className="text-left">{item.name}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">{price / 1000}k</td>
                <td className="text-right">{price * item.quantity / 1000}k</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="border-t border-dashed border-black my-2 pt-2 text-sm">
        <div className="flex justify-between font-bold">
          <span>TOTAL</span>
          <span>{formatCurrency(summary.totalSale)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Bayar ({paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}):</span>
          <span>{formatCurrency(paymentAmount)}</span>
        </div>
        {change > 0 && (
          <div className="flex justify-between text-xs">
            <span>Kembali:</span>
            <span>{formatCurrency(change)}</span>
          </div>
        )}
        {remainingAmount > 0 && (
          <div className="flex justify-between text-xs font-semibold">
            <span>Sisa:</span>
            <span>{formatCurrency(remainingAmount)}</span>
          </div>
        )}
      </div>

      <div className="text-center text-xs mt-4">
        <p>Terima kasih telah berbelanja!</p>
        <p>Barang yang sudah dibeli tidak dapat dikembalikan.</p>
      </div>
      <div className="mt-2">
        <Barcode value={transactionId} />
      </div>
    </div>
  );
});

export default Receipt;