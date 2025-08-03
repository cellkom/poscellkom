import { useState } from "react";
import PublicLayout from "@/components/Layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ReceiptModal from "@/components/modals/ReceiptModal"; // Import ReceiptModal
import { ServiceEntryWithCustomer } from "@/hooks/use-service-entries"; // Use the extended interface

type ServiceStatus = 'Pending' | 'Proses' | 'Selesai' | 'Gagal/Cancel' | 'Sudah Diambil'; // Updated to match ServiceEntry status types

const ServiceTrackingPage = () => {
  const [serviceId, setServiceId] = useState("");
  const [serviceData, setServiceData] = useState<ServiceEntryWithCustomer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isReceiptModalOpen, setReceiptModalOpen] = useState(false); // State for receipt modal

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId) {
      setError("Silakan masukkan ID Servis Anda.");
      return;
    }
    setLoading(true);
    setError(null);
    setServiceData(null);
    setSearched(true);

    try {
      // Ensure serviceId is a number for the edge function if it expects a number
      const parsedServiceId = parseInt(serviceId, 10);
      if (isNaN(parsedServiceId)) {
        throw new Error("ID Servis tidak valid. Harap masukkan angka.");
      }

      const { data, error: functionError } = await supabase.functions.invoke('get-service-status', {
        body: { serviceId: parsedServiceId }, // Pass the parsed number
      });

      if (functionError) {
        throw new Error("ID Servis tidak ditemukan atau terjadi kesalahan pada server.");
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data) {
        // Map the data to ServiceEntryWithCustomer interface
        const formattedData: ServiceEntryWithCustomer = {
          ...data,
          customerName: data.customers?.name || 'N/A',
          customerPhone: data.customers?.phone || 'N/A',
        };
        setServiceData(formattedData);
      } else {
        throw new Error("Data servis tidak ditemukan.");
      }

    } catch (err: any) {
      console.error("Error fetching service status:", err);
      setError(err.message || "Gagal melacak servis. Pastikan ID sudah benar.");
      toast.error("Gagal melacak status servis.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Proses':
        return 'bg-indigo-500 hover:bg-indigo-600';
      case 'Selesai':
        return 'bg-green-500 hover:bg-green-600';
      case 'Sudah Diambil':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'Gagal/Cancel':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-400 hover:bg-gray-500';
    }
  };

  const handleViewReceipt = () => {
    if (serviceData) {
      setReceiptModalOpen(true);
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Lacak Status Servis</CardTitle>
              <CardDescription>Masukkan ID Servis Anda untuk melihat progres perbaikan perangkat Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <Label htmlFor="serviceId" className="sr-only">ID Servis</Label>
                  <Input
                    id="serviceId"
                    type="text"
                    placeholder="Contoh: 123"
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Lacak
                </Button>
              </form>
            </CardContent>
          </Card>

          {loading && (
            <div className="text-center mt-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-muted-foreground">Mencari data servis...</p>
            </div>
          )}

          {error && !loading && (
            <Card className="mt-8 border-destructive">
              <CardHeader className="flex flex-row items-center gap-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div>
                  <CardTitle className="text-destructive">Gagal Melacak</CardTitle>
                  <CardDescription className="text-destructive/80">{error}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          )}

          {!loading && !error && serviceData && (
            <Card className="mt-8">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Detail Servis #SVC-{serviceData.id}</CardTitle>
                    <CardDescription>
                      Atas nama: {serviceData.customerName || 'N/A'}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(serviceData.status)} text-white`}>{serviceData.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Tanggal Masuk</Label>
                    <p className="font-medium">{format(new Date(serviceData.date), 'd MMMM yyyy, HH:mm', { locale: id })}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Tipe Perangkat</Label>
                    <p className="font-medium">{serviceData.device_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Info Status</Label>
                    <p className="font-medium">{serviceData.service_info || '-'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Keluhan</Label>
                  <p className="font-medium">{serviceData.description}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleViewReceipt}>
                  <Eye className="mr-2 h-4 w-4" /> Lihat Struk
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
      {serviceData && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          entry={serviceData}
        />
      )}
    </PublicLayout>
  );
};

export default ServiceTrackingPage;