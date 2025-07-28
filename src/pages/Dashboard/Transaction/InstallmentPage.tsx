import { useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInstallments } from "@/hooks/use-installments";
import { Installment, installmentsDB } from "@/data/installments";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { showSuccess, showError } from "@/utils/toast";
import { DollarSign, History } from "lucide-react";
import { formatServiceId } from "@/lib/utils";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const InstallmentPage = () => {
  const installments = useInstallments();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const handleOpenPaymentDialog = (installment: Installment) => {
    setSelectedInstallment(installment);
    setPaymentAmount(0);
    setIsPaymentDialogOpen(true);
  };

  const handleOpenHistoryDialog = (installment: Installment) => {
    setSelectedInstallment(installment);
    setIsHistoryDialogOpen(true);
  };

  const handlePaymentSubmit = () => {
    if (!selectedInstallment || paymentAmount <= 0) {
      showError("Jumlah pembayaran tidak valid.");
      return;
    }
    if (paymentAmount > selectedInstallment.remainingAmount) {
      showError("Jumlah pembayaran melebihi sisa tagihan.");
      return;
    }
    installmentsDB.addPayment(selectedInstallment.id, paymentAmount);
    showSuccess("Pembayaran berhasil dicatat!");
    setIsPaymentDialogOpen(false);
    setSelectedInstallment(null);
  };

  const activeInstallments = installments.filter(i => i.status === 'Belum Lunas');

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Cicilan (Hutang Piutang)</CardTitle>
        </CardHeader>
        <CardContent>
          {activeInstallments.length > 0 ? (
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
                    <TableCell className="font-medium">{inst.type === 'Servis' ? formatServiceId(inst.id) : inst.id}</TableCell>
                    <TableCell>{inst.customerName}</TableCell>
                    <TableCell>{formatCurrency(inst.totalAmount)}</TableCell>
                    <TableCell className="font-semibold text-red-600">{formatCurrency(inst.remainingAmount)}</TableCell>
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
              <div>No. Transaksi: <span className="font-semibold">{selectedInstallment.type === 'Servis' ? formatServiceId(selectedInstallment.id) : selectedInstallment.id}</span></div>
              <div>Pelanggan: <span className="font-semibold">{selectedInstallment.customerName}</span></div>
              <div>Sisa Tagihan: <span className="font-semibold text-red-600">{formatCurrency(selectedInstallment.remainingAmount)}</span></div>
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
              <div className="mb-4">No. Transaksi: <span className="font-semibold">{selectedInstallment.type === 'Servis' ? formatServiceId(selectedInstallment.id) : selectedInstallment.id}</span></div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInstallment.paymentHistory.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(payment.date, "d MMMM yyyy, HH:mm", { locale: id })}</TableCell>
                      <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default InstallmentPage;