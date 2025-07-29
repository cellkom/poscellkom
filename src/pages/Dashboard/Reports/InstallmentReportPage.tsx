import { useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInstallments, Installment, InstallmentPayment } from "@/hooks/use-installments";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { showSuccess, showError } from "@/utils/toast";
import { DollarSign, History, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const InstallmentReportPage = () => {
  const { user } = useAuth();
  const { installments, loading, addPayment, getPaymentHistory } = useInstallments();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<InstallmentPayment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const handleOpenPaymentDialog = (installment: Installment) => {
    setSelectedInstallment(installment);
    setPaymentAmount(0);
    setIsPaymentDialogOpen(true);
  };

  const handleOpenHistoryDialog = async (installment: Installment) => {
    setSelectedInstallment(installment);
    setIsHistoryDialogOpen(true);
    setHistoryLoading(true);
    const history = await getPaymentHistory(installment.id);
    setPaymentHistory(history);
    setHistoryLoading(false);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedInstallment || paymentAmount <= 0) {
      showError("Jumlah pembayaran tidak valid.");
      return;
    }
    if (paymentAmount > selectedInstallment.remaining_amount) {
      showError("Jumlah pembayaran melebihi sisa tagihan.");
      return;
    }
    if (!user) {
      showError("Sesi pengguna tidak ditemukan.");
      return;
    }

    const success = await addPayment(selectedInstallment.id, paymentAmount, user.id);
    if (success) {
      setIsPaymentDialogOpen(false);
      setSelectedInstallment(null);
    }
  };

  const activeInstallments = installments.filter(i => i.status === 'Belum Lunas');

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Cicilan (Piutang)</CardTitle>
          <p className="text-muted-foreground">Kelola tagihan pelanggan yang belum lunas.</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : activeInstallments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Transaksi</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Total Tagihan</TableHead>
                  <TableHead>Sisa Tagihan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeInstallments.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell className="font-mono">{inst.transaction_id_display}</TableCell>
                    <TableCell>{inst.customer_name_cache}</TableCell>
                    <TableCell>{formatCurrency(inst.total_amount)}</TableCell>
                    <TableCell className="font-semibold text-red-600">{formatCurrency(inst.remaining_amount)}</TableCell>
                    <TableCell>
                      <Badge variant={inst.status === 'Lunas' ? 'default' : 'destructive'}>{inst.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenHistoryDialog(inst)}>
                        <History className="h-4 w-4 mr-2" /> Riwayat
                      </Button>
                      <Button size="sm" onClick={() => handleOpenPaymentDialog(inst)}>
                        <DollarSign className="h-4 w-4 mr-2" /> Bayar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">Tidak ada data cicilan yang belum lunas.</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Pembayaran Cicilan</DialogTitle>
          </DialogHeader>
          {selectedInstallment && (
            <div className="space-y-4 py-4">
              <div>No. Transaksi: <span className="font-semibold">{selectedInstallment.transaction_id_display}</span></div>
              <div>Pelanggan: <span className="font-semibold">{selectedInstallment.customer_name_cache}</span></div>
              <div>Sisa Tagihan: <span className="font-semibold text-red-600">{formatCurrency(selectedInstallment.remaining_amount)}</span></div>
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Jumlah Pembayaran</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  placeholder="Masukkan jumlah pembayaran"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsPaymentDialogOpen(false)}>Batal</Button>
            <Button onClick={handlePaymentSubmit}>Simpan Pembayaran</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Riwayat Pembayaran</DialogTitle>
          </DialogHeader>
          {selectedInstallment && (
            <div>
              <div className="mb-4">No. Transaksi: <span className="font-semibold">{selectedInstallment.transaction_id_display}</span></div>
              {historyLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : paymentHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{format(new Date(payment.created_at), "d MMMM yyyy, HH:mm", { locale: id })}</TableCell>
                        <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">Belum ada riwayat pembayaran.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default InstallmentReportPage;