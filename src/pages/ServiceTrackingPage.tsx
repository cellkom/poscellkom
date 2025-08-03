import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { showError } from '@/utils/toast';

type ServiceStatus = 'Pending' | 'Proses' | 'Selesai' | 'Gagal/Cancel' | 'Sudah Diambil';

interface ServiceEntryDetail {
  id: string;
  created_at: string;
  customer_id: string;
  kasir_id: string;
  category: string | null;
  device_type: string | null;
  damage_type: string | null;
  description: string | null;
  status: ServiceStatus;
  date: string;
  service_info: string | null;
  info_date: string | null; // Ensure this is included
  customers: {
    name: string;
    phone: string;
    address: string | null;
  } | null;
  users: {
    full_name: string;
  } | null;
}

const getStatusBadgeVariant = (status: ServiceStatus) => {
  switch (status) {
    case 'Pending':
      return 'secondary';
    case 'Proses':
      return 'default';
    case 'Selesai':
    case 'Sudah Diambil':
      return 'default';
    case 'Gagal/Cancel':
      return 'destructive';
    default:
      return 'outline';
  }
};

const ServiceTrackingPage = () => {
  const { id: serviceId } = useParams<{ id: string }>();
  const [serviceEntry, setServiceEntry] = useState<ServiceEntryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceEntry = async () => {
      if (!serviceId) {
        setError("ID Servis tidak ditemukan.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('service_entries')
        .select(`
          *,
          customers (name, phone, address),
          users (full_name)
        `)
        .eq('id', serviceId)
        .single();

      if (error) {
        console.error("Error fetching service entry:", error);
        showError("Gagal memuat detail servis: " + error.message);
        setError("Gagal memuat detail servis. Pastikan ID servis benar.");
        setServiceEntry(null);
      } else if (data) {
        setServiceEntry(data);
      } else {
        setError("Servis tidak ditemukan.");
        setServiceEntry(null);
      }
      setLoading(false);
    };

    fetchServiceEntry();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat data servis...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!serviceEntry) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Servis Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Data servis dengan ID ini tidak ditemukan.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Detail Servis</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">No. Servis</Label>
              <p className="text-lg font-medium">SVC-{serviceEntry.id}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Status Servis</Label>
              <Badge variant={getStatusBadgeVariant(serviceEntry.status)} className="text-lg px-3 py-1">
                {serviceEntry.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Tanggal Masuk</Label>
              <p className="text-lg font-medium">{format(new Date(serviceEntry.date), 'dd MMMM yyyy', { locale: id })}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Tanggal di Infokan</Label>
              <p className="text-lg font-medium">
                {serviceEntry.info_date ? format(new Date(serviceEntry.info_date), 'dd MMMM yyyy', { locale: id }) : '-'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Nama Pelanggan</Label>
              <p className="text-lg font-medium">{serviceEntry.customers?.name || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Nomor Telepon</Label>
              <p className="text-lg font-medium">{serviceEntry.customers?.phone || 'N/A'}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Alamat Pelanggan</Label>
            <p className="text-lg font-medium">{serviceEntry.customers?.address || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Kategori Perangkat</Label>
              <p className="text-lg font-medium">{serviceEntry.category || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Tipe Perangkat</Label>
              <p className="text-lg font-medium">{serviceEntry.device_type || 'N/A'}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Jenis Kerusakan</Label>
            <p className="text-lg font-medium">{serviceEntry.damage_type || 'N/A'}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Deskripsi Kerusakan</Label>
            <p className="text-lg font-medium">{serviceEntry.description || 'N/A'}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Info Status Servis</Label>
            <p className="text-lg font-medium">{serviceEntry.service_info || 'Belum ada info'}</p>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Ditangani Oleh</Label>
            <p className="text-lg font-medium">{serviceEntry.users?.full_name || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceTrackingPage;