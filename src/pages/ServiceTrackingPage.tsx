import { useState } from "react";
import PublicLayout from "@/components/Layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

type ServiceStatus = 'Pending' | 'Diagnosa' | 'Menunggu Konfirmasi' | 'Dikerjakan' | 'Selesai' | 'Diambil' | 'Dibatalkan';

interface ServiceEntry {
  id: number;
  created_at: string;
  customer_id: string;
  kasir_id: string;
  category: string;
  device_type: string;
  damage_type: string;
  description: string;
  status: ServiceStatus;
  date: string;
  customers: {
    name: string;
  } | null;
}

const ServiceTrackingPage = () => {
  const [serviceId, setServiceId] = useState("");
  const [serviceData, setServiceData] = useState<ServiceEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

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
      const { data, error: functionError } = await supabase.functions.invoke('get-service-status', {
        body: { serviceId },
      });

      if (functionError) {
        // The function itself returned an error (e.g., 404, 500)
        throw new Error("ID Servis tidak ditemukan atau terjadi kesalahan pada server.");
      }
      
      if (data.error) {
        // The function returned a JSON with an error property
        throw new Error(data.error);
      }

      if (data) {
        setServiceData(data);
      } else {
        // Handle case where data is null/undefined but no error was thrown
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
      case 'Diagnosa':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Menunggu Konfirmasi':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'Dikerjakan':
        return 'bg-indigo-500 hover:bg-indigo-600';
      case 'Selesai':
        return 'bg-green-500 hover:bg-green-600';
      case 'Diambil':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'Dibatalkan':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-400 hover:bg-gray-500';
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
                    <CardTitle>Detail Servis #{serviceData.id}</CardTitle>
                    <CardDescription>
                      Atas nama: {serviceData.customers?.name || 'N/A'}
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
                    <Label className="text-sm text-muted-foreground">Kategori</Label>
                    <p className="font-medium">{serviceData.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Tipe Perangkat</Label>
                    <p className="font-medium">{serviceData.device_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Jenis Kerusakan</Label>
                    <p className="font-medium">{serviceData.damage_type}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Keluhan</Label>
                  <p className="font-medium">{serviceData.description}</p>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Jika ada pertanyaan, silakan hubungi kami dengan menyertakan ID Servis Anda.
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default ServiceTrackingPage;