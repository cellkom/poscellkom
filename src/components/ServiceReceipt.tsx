import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import Barcode from '@/components/Barcode';
import logoSrc from '/logo.png';

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface UsedPart {
  name: string;
  quantity: number;
  retailPrice: number;
}

interface ServiceTransaction {
  id: string;
  date: Date;
  customerName: string;
  description: string;
  usedParts: UsedPart[];
  serviceFee: number;
  total: number;
  paymentAmount: number;
  change: number;
  remainingAmount: number;
}

interface ReceiptProps {
  transaction: ServiceTransaction;
}

const ServiceReceipt = forwardRef<HTMLDivElement, ReceiptProps>(({ transaction }, ref) => {
  if (!transaction) return null;

  const { id, date, customerName, description, usedParts, total, paymentAmount, change, remainingAmount } = transaction;

  return (
    <div ref={ref} id="receipt-print-area" className="bg-white text-black p-4 font-mono max-w-sm mx-auto border rounded-lg">
      <div className="text-center">
        <img src={logoSrc} alt="CELLKOM Logo" className="h-16 w-auto mx-auto mb-2" />
        <p className="text-xs">Jl. Merdeka No. 123, Kota Anda</p>
        <p className="text-xs">Telp: 0812-3456-7890</p>
        <h3 className="font-bold text-lg mt-2 border-y border-dashed border-black py-1">NOTA SERVICE</h3>
      </div>

      <div className="border-b border-dashed border-black my-2 py-1 text-xs">
        <div className="flex justify-between"><span>No: SVC-{id}</span><span>{format(date, 'dd/MM/yy HH:mm')}</span></div>
        <div className="flex justify-between"><span>Kasir: admin</span><span>Pelanggan: {customerName}</span></div>
      </div>
      
      <div className="my-2 py-1 text-xs">
        <p className="font-bold">Deskripsi:</p>
        <p>{description}</p>
      </div>

      {usedParts.length > 0 && (
        <table className="w-full text-xs my-2">
          <thead>
            <tr><th colSpan={4} className="text-left font-normal border-b border-dashed border-black pb-1">Sparepart Digunakan:</th></tr>
          </thead>
          <tbody>
            {usedParts.map((part, index) => (
              <tr key={index}>
                <td colSpan={4} className="text-left">{part.name} ({part.quantity}x)</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="border-t border-dashed border-black my-2 pt-2 text-sm">
        <div className="flex justify-between font-bold">
          <span>TOTAL</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Bayar:</span>
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
        <p>Terima kasih atas kepercayaan Anda!</p>
        <p>Garansi service berlaku 7 hari.</p>
      </div>
      <div className="mt-2">
        <Barcode value={`SVC-${id}`} />
      </div>
    </div>
  );
});

export default ServiceReceipt;