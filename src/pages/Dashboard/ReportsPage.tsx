import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

// Define a unified transaction type
type Transaction = {
  id: string | number;
  created_at: string;
  display_id: string;
  type: 'Penjualan' | 'Servis';
  customer_name: string | null;
  amount: number;
  payment_method: string | null;
};

const ReportsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // Fetch sales transactions
        const { data: sales, error: salesError } = await supabase
          .from('sales_transactions')
          .select('id, created_at, transaction_id_display, customer_name_cache, total, payment_method');

        if (salesError) {
          console.error("Sales Error:", salesError);
          throw salesError;
        }

        // Fetch service transactions
        const { data: services, error: servicesError } = await supabase
          .from('service_transactions')
          .select('id, created_at, customer_name_cache, total_amount, payment_method, service_entry_id');
        
        if (servicesError) {
          console.error("Service Error:", servicesError);
          throw servicesError;
        }

        const formattedSales: Transaction[] = (sales || []).map(s => ({
          id: s.id,
          created_at: s.created_at,
          display_id: s.transaction_id_display || `SALE-${s.id.toString().substring(0, 4)}`,
          type: 'Penjualan',
          customer_name: s.customer_name_cache,
          amount: s.total,
          payment_method: s.payment_method,
        }));

        const formattedServices: Transaction[] = (services || []).map(s => ({
          id: s.id,
          created_at: s.created_at,
          display_id: `SERVICE-${s.service_entry_id}`,
          type: 'Servis',
          customer_name: s.customer_name_cache,
          amount: s.total_amount,
          payment_method: s.payment_method,
        }));

        const combined = [...formattedSales, ...formattedServices]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setTransactions(combined);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Laporan Transaksi</h1>
          <p className="text-muted-foreground">
            Menampilkan semua transaksi penjualan dan servis.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Semua Transaksi</CardTitle>
          <CardDescription>Daftar semua transaksi yang tercatat dalam sistem.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Memuat data transaksi...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16">
                <p className="text-muted-foreground">Belum ada data transaksi.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>ID Transaksi</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Metode Bayar</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={`${tx.type}-${tx.id}`}>
                    <TableCell>{format(new Date(tx.created_at), "dd MMM yyyy, HH:mm", { locale: id })}</TableCell>
                    <TableCell className="font-medium">{tx.display_id}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === 'Penjualan' ? 'default' : 'secondary'}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{tx.customer_name || "-"}</TableCell>
                    <TableCell>{tx.payment_method || "-"}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;