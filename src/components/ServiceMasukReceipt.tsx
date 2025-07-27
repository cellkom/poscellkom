import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import Barcode from '@/components/Barcode';

interface ServiceEntry {
  id: string;
  date: Date;
  customerName: string;
  customerPhone: string;
  category: string;
  damageType: string;
  description: string;
}

interface ReceiptProps {
  entry: ServiceEntry;
}

const ServiceMasukReceipt = forwardRef<HTMLDivElement, ReceiptProps>(({ entry }, ref) => {
  if (!entry) return null;

  return (
    <div ref={ref} id="receipt-print-area" className="bg-white text-black p-4 font-mono max-w-sm mx-auto border rounded-lg">
      <div className="text-center">
        <h2 className="text-xl font-bold">CELLKOM</h2>
        <p className="text-xs">Jl. Merdeka No. 123, Kota Anda</p>
        <p className="text-xs">Telp: 0812-3456-7890</p>
        <h3 className="font-bold text-lg mt-2 border-y border-dashed border-black py-1">TANDA TERIMA SERVICE</h3>
      </div>

      <div className="my-2 py-1 text-xs space-y-1">
        <div className="flex justify-between"><span>No. Service:</span> <span>{entry.id}</span></div>
        <div className="flex justify-between"><span>Tanggal:</span> <span>{format(entry.date, 'dd/MM/yy HH:mm')}</span></div>
      </div>

      <div className="border-t border-dashed border-black my-2 py-2 text-xs space-y-1">
        <p className="font-bold">DATA PELANGGAN:</p>
        <div>Nama: {entry.customerName}</div>
        <div>Telepon: {entry.customerPhone}</div>
      </div>

      <div className="border-t border-dashed border-black my-2 py-2 text-xs space-y-1">
        <p className="font-bold">INFORMASI PERANGKAT:</p>
        <div>Kategori: {entry.category}</div>
        <div>Kerusakan: {entry.damageType}</div>
        <div>Deskripsi: {entry.description}</div>
      </div>

      <div className="text-center text-xs mt-4">
        <p className="font-bold">Simpan struk ini sebagai bukti pengambilan barang.</p>
        <p>Kami tidak bertanggung jawab atas kehilangan struk.</p>
      </div>
      <div className="mt-2">
        <Barcode value={entry.id} />
      </div>
    </div>
  );
});

export default ServiceMasukReceipt;