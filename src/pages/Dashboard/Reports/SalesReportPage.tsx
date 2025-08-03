import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Printer, Search } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useSalesReport } from '@/hooks/use-sales-report';
import { useReactToPrint } from 'react-to-print';
import { SalesReportPrintLayout } from './SalesReportPrintLayout';
import { useAppSettings } from '@/hooks/use-app-settings';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const SalesReportPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { reportData, loading, generateReport } = useSalesReport();
  const { getSetting } = useAppSettings();

  const businessName = getSetting('business_name');
  const businessLogo = getSetting('business_logo_url');

  const componentToPrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentToPrintRef.current,
    documentTitle: `Laporan-Penjualan-${dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}-${dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `
  });

  const handleSearch = () => {
    if (dateRange?.from && dateRange?.to) {
      generateReport(dateRange.from, dateRange.to);
    }
  };

  const totalSales = reportData.reduce((sum, tx) => sum + tx.total, 0);
  const totalProfit = reportData.reduce((sum, tx) => sum + tx.total_profit, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Laporan Penjualan</h1>
      
      <div className="flex flex-wrap justify-between items-center p-4 bg-white rounded-lg shadow gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          <Button onClick={handleSearch} disabled={loading || !dateRange?.from || !dateRange?.to}>
            <Search className="mr-2 h-4 w-4" /> Cari
          </Button>
        </div>
        <Button onClick={handlePrint} disabled={reportData.length === 0 || loading}>
          <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hasil Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Memuat data...</p>
          ) : reportData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left font-semibold">Tanggal</th>
                      <th className="p-2 text-left font-semibold">No. Transaksi</th>
                      <th className="p-2 text-left font-semibold">Pelanggan</th>
                      <th className="p-2 text-left font-semibold">Detail Barang</th>
                      <th className="p-2 text-right font-semibold">Total</th>
                      <th className="p-2 text-right font-semibold">Laba</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((tx) => (
                      <tr key={tx.id} className="border-t hover:bg-gray-50">
                        <td className="p-2 align-top">{format(new Date(tx.created_at), 'dd/MM/yy HH:mm', { locale: id })}</td>
                        <td className="p-2 align-top">{tx.transaction_id_display}</td>
                        <td className="p-2 align-top">{tx.customer_name_cache || 'Umum'}</td>
                        <td className="p-2 align-top">
                          <ul className="list-disc list-inside">
                            {tx.items.map((item, index) => (
                              <li key={index}>
                                {item.product_name} ({item.quantity}x)
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="p-2 text-right align-top">{new Intl.NumberFormat('id-ID').format(tx.total)}</td>
                        <td className="p-2 text-right align-top">{new Intl.NumberFormat('id-ID').format(tx.total_profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-end">
                <div className="w-full md:w-1/3 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Total Penjualan:</span>
                    <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalSales)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total Laba:</span>
                    <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalProfit)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Informasi</AlertTitle>
              <AlertDescription>
                Silakan pilih rentang tanggal dan klik "Cari" untuk menampilkan laporan.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="hidden print:block">
        <SalesReportPrintLayout 
          ref={componentToPrintRef} 
          reportData={reportData}
          startDate={dateRange?.from || null}
          endDate={dateRange?.to || null}
          businessName={businessName}
          businessLogo={businessLogo}
        />
      </div>
    </div>
  );
};

export default SalesReportPage;