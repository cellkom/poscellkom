import React from 'react';
import { ServiceTransaction } from '@/pages/Dashboard/Reports/ServiceReportPage';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import logoSrc from '/logo.png';

interface ServiceReportPrintProps {
  data: ServiceTransaction[];
  range?: DateRange;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const ServiceReportPrint: React.FC<ServiceReportPrintProps> = ({ data, range }) => {
  const summary = React.useMemo(() => {
    const totalRevenue = data.reduce((sum, t) => sum + t.total_amount, 0);
    const totalCost = data.reduce((sum, t) => {
      const cost = t.service_parts_used.reduce((partSum, part) => partSum + (part.products.buy_price * part.quantity), 0);
      return sum + cost;
    }, 0);
    const totalProfit = totalRevenue - totalCost;
    return { totalRevenue, totalProfit, totalTransactions: data.length };
  }, [data]);

  return (
    <div className="p-4">
      <header className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Laporan Service</h1>
          <p className="text-muted-foreground">
            Periode: {range?.from ? format(range.from, "d MMM yyyy") : ''} - {range?.to ? format(range.to, "d MMM yyyy") : ''}
          </p>
        </div>
        <img src={logoSrc} alt="CELLKOM Logo" className="h-12 w-auto" />
      </header>

      <main>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-semibold">Tanggal</th>
              <th className="text-left p-2 font-semibold">No. Service</th>
              <th className="text-left p-2 font-semibold">Pelanggan</th>
              <th className="text-left p-2 font-semibold">Deskripsi</th>
              <th className="text-right p-2 font-semibold">Total</th>
              <th className="text-right p-2 font-semibold">Laba</th>
            </tr>
          </thead>
          <tbody>
            {data.map(t => {
              const cost = t.service_parts_used.reduce((sum, part) => sum + (part.products.buy_price * part.quantity), 0);
              const profit = t.total_amount - cost;
              return (
                <tr key={t.id} className="border-b">
                  <td className="p-2">{format(new Date(t.created_at), 'yyyy-MM-dd HH:mm')}</td>
                  <td className="p-2 font-mono">SVC-{t.service_entry_id}</td>
                  <td className="p-2">{t.customer_name_cache || 'N/A'}</td>
                  <td className="p-2">{t.description}</td>
                  <td className="text-right p-2">{formatCurrency(t.total_amount)}</td>
                  <td className="text-right p-2">{formatCurrency(profit)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </main>

      <footer className="mt-6 pt-4 border-t">
        <div className="w-1/2 ml-auto space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold">Total Transaksi:</span>
            <span>{summary.totalTransactions}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Total Pendapatan:</span>
            <span>{formatCurrency(summary.totalRevenue)}</span>
          </div>
          <div className="flex justify-between font-bold text-base">
            <span className="font-semibold">Total Laba:</span>
            <span>{formatCurrency(summary.totalProfit)}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServiceReportPrint;