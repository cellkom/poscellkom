import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers } from "@/hooks/use-customers";
import { useInstallments } from "@/hooks/use-installments";
import { useAuth } from "@/contexts/AuthContext";
import { showError } from "@/utils/toast";
import { ArrowLeft, DollarSign, Loader2 } from "lucide-react";

const AddInstallmentPage = () => {
  const navigate = useNavigate();
  const { customers, loading: customersLoading } = useCustomers();
  const { addManualInstallment } = useInstallments();
  const { user } = useAuth();

  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showError("Sesi pengguna tidak valid. Silakan login ulang.");
      return;
    }
    if (!customerId || amount <= 0) {
      showError("Harap pilih pelanggan dan masukkan jumlah yang valid.");
      return;
    }

    setIsSubmitting(true);
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (!selectedCustomer) {
        showError("Pelanggan tidak ditemukan.");
        setIsSubmitting(false);
        return;
    }

    const success = await addManualInstallment(
      customerId,
      selectedCustomer.name,
      amount,
      description,
      user.id
    );

    setIsSubmitting(false);
    if (success) {
      navigate("/dashboard/transaction/installments");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
            <Button asChild variant="outline">
                <Link to="/dashboard/transaction/installments">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Kelola Cicilan
                </Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tambah Cicilan Manual</CardTitle>
            <p className="text-muted-foreground">
              Gunakan form ini untuk mencatat piutang yang tidak berasal dari transaksi penjualan atau service.
            </p>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer">Pelanggan</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Pilih pelanggan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customersLoading ? (
                      <div className="p-4 text-center text-sm">Memuat pelanggan...</div>
                    ) : (
                      customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.phone || 'No HP'})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Jumlah Cicilan (Total Piutang)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  placeholder="Contoh: Pinjaman modal, titipan barang, dll."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DollarSign className="mr-2 h-4 w-4" />
                )}
                Simpan Cicilan
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddInstallmentPage;