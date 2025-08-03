import React from 'react';
import { SalesTransactionReport } from '@/hooks/use-sales-report';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface SalesReportPrintLayoutProps {
  reportData: SalesTransactionReport[];
  startDate: Date | null;
  endDate: Date | null;
  businessName: string | null;
  businessLogo: string | null;
}

export const SalesReportPrintLayout = React.forwardRef<HTMLDivElement, SalesReportPrintLayoutProps>(
  ({ reportData, startDate, endDate, businessName, businessLogo }, ref) => {
    
    const totalSales = reportData.reduce((sum, tx) => sum + tx.total, 0);
    const totalProfit = reportData.reduce((sum, tx) => sum + tx.total_profit, 0);

    const formatDateRange = () => {
      if (!startDate || !endDate) return '';
      const start = format(startDate, 'd MMMM yyyy', { locale: id });
      const end = format(endDate, 'd MMMM yyyy', { locale: id });
      return start === end ? start : `${start} - ${end}`;
    };

    return (
      <div ref={ref} className="p-4 bg-white text-black font-sans">
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center">
            {businessLogo && <img src={businessLogo} alt="Logo Bisnis" className="h-16 w-auto mr-4" />}
            <h1 className="text-2xl font-bold">{businessName || 'Laporan Penjualan'}</h1>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">Laporan Penjualan</p>
            <p className="text-sm">{formatDateRange()}</p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Tanggal</th>
              <th className="border border-gray-300 p-2 text-left">No. Transaksi</th>
              <th className="border border-gray-300 p-2 text-left">Pelanggan</th>
              <th className="border border-gray-300 p-2 text-left">Detail Barang</th>
              <th className="border border-gray-300 p-2 text-right">Total</th>
              <th className="border border-gray-300 p-2 text-right">Laba</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map(tx => (
              <tr key={tx.id} className="border-b">
                <td className="border border-gray-300 p-2 align-top">{format(new Date(tx.created_at), 'dd/MM/yy HH:mm')}</td>
                <td className="border border-gray-300 p-2 align-top">{tx.transaction_id_display}</td>
                <td className="border border-gray-300 p-2 align-top">{tx.customer_name_cache || 'Umum'}</td>
                <td className="border border-gray-300 p-2 align-top">
                  <ul className="pl-0">
                    {tx.items.map((item, index) => (
                      <li key={index}>
                        {item.product_name} ({item.quantity}x @ {new Intl.NumberFormat('id-ID').format(item.sale_price_at_sale)})
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="border border-gray-300 p-2 text-right align-top">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.total)}
                </td>
                <td className="border border-gray-300 p-2 text-right align-top">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.total_profit)}
                </td>
              </tr>
            ))}
             {reportData.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 border border-gray-300">Tidak ada data untuk periode yang dipilih.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-1/2 md:w-1/3">
            <div className="flex justify-between font-bold text-base border-t-2 border-black pt-2">
              <span>Total Penjualan:</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalSales)}</span>
            </div>
            <div className="flex justify-between font-bold text-base mt-2">
              <span>Total Laba:</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalProfit)}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center text-xs text-gray-500">
          Laporan ini dibuat pada {format(new Date(), "d MMMM yyyy, HH:mm:ss", { locale: id })}
        </div>
      </div>
    );
  }
);