import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import logoSrc from '/logo.png';

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

interface Transaction {
  id: string;
  created_at: string;
  transaction_id_display: string;
  customer_name_cache: string;
  total: number;
  profit: number;
}

interface SalesReportPrintLayoutProps {
  transactions: Transaction[];
  summary: {
    totalRevenue: number;
    totalProfit: number;
    totalTransactions: number;
  };
  dateRange: { from: Date; to: Date };
}

const SalesReportPrintLayout = React.forwardRef<HTMLDivElement, SalesReportPrintLayoutProps>(({ transactions, summary, dateRange }, ref) => {
  return (
    <div ref={ref} className="p-8 font-sans bg-white text-black">
      <header className="flex justify-between items-center pb-4 border-b-2 border-black">
        <div>
          <h1 className="text-3xl font-bold">Laporan Penjualan</h1>
          <p className="text-gray-600">Periode: {format(dateRange.from, 'd MMMM yyyy', { locale: id })} - {format(dateRange.to, 'd MMMM yyyy', { locale: id })}</p>
        </div>
        <img src={logoSrc} alt="CELLKOM Logo" className="h-16 w-auto" />
      </header>

      <main className="mt-8">
        <table className="w-full text-sm table-auto">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 px-1">Tanggal</th>
              <th className="text-left py-2 px-1">No. Transaksi</th>
              <th className="text-left py-2 px-1">Pelanggan</th>
              <th className="text-right py-2 px-1">Total</th>
              <th className="text-right py-2 px-1">Laba</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="border-b border-gray-200">
                <td className="py-2 px-1">{format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm')}</td>
                <td className="py-2 px-1 font-mono">{tx.transaction_id_display}</td>
                <td className="py-2 px-1">{tx.customer_name_cache || 'Umum'}</td>
                <td className="text-right py-2 px-1">{formatCurrency(tx.total)}</td>
                <td className="text-right py-2 px-1">{formatCurrency(tx.profit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <footer className="mt-8 pt-4 border-t-2 border-black">
        <h2 className="text-xl font-bold mb-2">Ringkasan</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-600">Total Transaksi</p>
            <p className="text-2xl font-bold">{summary.totalTransactions}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-600">Total Pendapatan</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-600">Total Laba</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalProfit)}</p>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-8 text-xs">
          <p>Laporan ini dibuat pada {format(new Date(), 'd MMMM yyyy, HH:mm', { locale: id })}</p>
          <p>CELLKOM - Solusi Komunikasi Anda</p>
        </div>
      </footer>
    </div>
  );
});

export default SalesReportPrintLayout;