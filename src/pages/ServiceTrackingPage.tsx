import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ServiceEntry {
  id: string;
  created_at: string;
  customer_id: string;
  kasir_id: string;
  category: string | null;
  device_type: string | null;
  damage_type: string | null;
  description: string | null;
  status: 'Pending' | 'Proses' | 'Selesai' | 'Gagal/Cancel' | 'Sudah Diambil';
  date: string;
  service_info: string | null;
  info_date: string | null;
  customers: {
    name: string;
    phone: string;
  } | null;
}

const getStatusColor = (status: ServiceEntry['status']) => {
  switch (status) {
    case 'Pending':
      return 'bg-gray-500'; // This color will not be seen now
    case 'Proses':
      return 'bg-blue-500';
    case 'Selesai':
    case 'Sudah Diambil':
      return 'bg-green-500';
    case 'Gagal/Cancel':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const ServiceTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [serviceData, setServiceData] = useState<ServiceEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceData = async () => {
      setLoading(true);
      setError(null);
      if (!id) {
        setError("ID Servis tidak ditemukan.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('service_entries')
        .select(`
          *,
          customers (name, phone)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching service data:", error);
        setError("Gagal memuat data servis. Pastikan ID servis benar.");
        setServiceData(null);
      } else if (data) {
        setServiceData(data);
      } else {
        setError("Data servis tidak ditemukan.");
        setServiceData(null);
      }
      setLoading(false);
    };

    fetchServiceData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-lg">Memuat data servis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Servis Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Data servis dengan ID {id} tidak ditemukan.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Detail Servis: SVC-{serviceData.id}</CardTitle>
            {serviceData.status !== 'Pending' && (
              <Badge className={`${getStatusColor(serviceData.status)} text-white`}>{serviceData.status}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <p className="text-sm text-gray-500">Nama Pelanggan</p>
              <p className="font-medium">{serviceData.customers?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nomor Telepon</p>
              <p className="font-medium">{serviceData.customers?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tanggal Masuk</p>
              <p className="font-medium">{format(new Date(serviceData.date), 'dd MMMM yyyy', { locale: id })}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tipe Perangkat</p>
              <p className="font-medium">{serviceData.device_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jenis Kerusakan</p>
              <p className="font-medium">{serviceData.damage_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deskripsi</p>
              <p className="font-medium">{serviceData.description}</p>
            </div>
          </div>

          {(serviceData.service_info || serviceData.info_date) && (
            <>
              <Separator className="my-4" />
              <h3 className="text-lg font-semibold">Informasi Status Servis</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {serviceData.service_info && (
                  <div>
                    <p className="text-sm text-gray-500">Info Status</p>
                    <p className="font-medium">{serviceData.service_info}</p>
                  </div>
                )}
                {serviceData.info_date && (
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Info</p>
                    <p className="font-medium">{format(new Date(serviceData.info_date), 'dd MMMM yyyy, HH:mm', { locale: id })}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceTrackingPage;