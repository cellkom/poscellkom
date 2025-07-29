import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon, Printer, Loader2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define the structure of our transaction data
interface ServiceTransaction {
  id: number;
  created_at: string;
  customer_name_cache: string;
  total_amount: number;
  service_fee: number;
  service_entry: {
    device_type: string;
    status: string;
  };
  parts: {
    quantity: number;
    sale_price: number;
    product: {
      buy_price: number;
    } | null;
  }[];
}

const ServiceReportPage = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [transactions, setTransactions] = useState<ServiceTransaction[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const reportRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: "Laporan-Transaksi-Service",
    onAfterPrint: () => toast.success("Laporan berhasil dicetak!"),
  });

  const handleGenerateReport = async () => {
    if (!date?.from || !date?.to) {
      toast.error("Silakan pilih rentang tanggal terlebih dahulu.");
      return;
    }

    setLoading(true);
    setReportGenerated(false);

    const fromDate = format(date.from, "yyyy-MM-dd'T'00:00:00");
    const toDate = format(date.to, "yyyy-MM-dd'T'23:59:59");

    try {
      const { data, error } = await supabase
        .from("service_transactions")
        .select(`
          id,
          created_at,
          customer_name_cache,
          total_amount,
          service_fee,
          service_entry:service_entries(device_type, status),
          parts:service_parts_used(
            quantity,
            sale_price,
            product:products(buy_price)
          )
        `)
        .gte("created_at", fromDate)
        .lte("created_at", toDate)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      let revenue = 0;
      let profit = 0;

      data.forEach(tx => {
        revenue += tx.total_amount;

        const partsCost = tx.parts.reduce((acc, part) => {
            const buyPrice = part.product?.buy_price ?? 0;
            return acc + (buyPrice * part.quantity);
        }, 0);
        
        const partsRevenue = tx.parts.reduce((acc, part) => {
            return acc + (part.sale_price * part.quantity);
        }, 0);

        const transactionProfit = tx.service_fee + (partsRevenue - partsCost);
        profit += transactionProfit;
      });

      setTransactions(data as ServiceTransaction[]);
      setTotalRevenue(revenue);
      setTotalProfit(profit);
      setReportGenerated(true);
      toast.success("Laporan berhasil dibuat!");

    } catch (error: any) {
      toast.error("Gagal mengambil data laporan:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Laporan Transaksi Jasa Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleGenerateReport} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Buat Laporan
            </Button>
            {reportGenerated && (
              <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {reportGenerated && (
        <Card>
            <CardContent ref={reportRef} className="p-6 print:p-2">
                <div className="print-header text-center mb-6">
                    <h2 className="text-2xl font-bold">CELLKOM</h2>
                    <p className="text-sm">Laporan Transaksi Jasa Service</p>
                    {date?.from && date?.to && (
                        <p className="text-sm text-muted-foreground">
                            Periode: {format(date.from, "d MMMM yyyy")} - {format(date.to, "d MMMM yyyy")}
                        </p>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2 text-left">No</th>
                                <th className="p-2 text-left">Tanggal</th>
                                <th className="p-2 text-left">ID Transaksi</th>
                                <th className="p-2 text-left">Pelanggan</th>
                                <th className="p-2 text-left">Perangkat</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-right">Total Biaya</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, index) => (
                                <tr key={tx.id} className="border-b">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{format(new Date(tx.created_at), "dd/MM/yyyy")}</td>
                                    <td className="p-2">{`SVC-${tx.id}`}</td>
                                    <td className="p-2">{tx.customer_name_cache}</td>
                                    <td className="p-2">{tx.service_entry?.device_type ?? 'N/A'}</td>
                                    <td className="p-2">{tx.service_entry?.status ?? 'N/A'}</td>
                                    <td className="p-2 text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.total_amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold">
                                <td colSpan={6} className="p-2 text-right">Total Pendapatan:</td>
                                <td className="p-2 text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalRevenue)}</td>
                            </tr>
                            <tr className="font-bold">
                                <td colSpan={6} className="p-2 text-right">Total Laba:</td>
                                <td className="p-2 text-right">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalProfit)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceReportPage;