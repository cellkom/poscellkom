import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import ServiceMasukReceipt from "@/components/ServiceMasukReceipt";
import { ServiceEntryWithCustomer } from "@/hooks/use-service-entries";
import { toPng } from 'html-to-image';
import { showSuccess, showError } from '@/utils/toast';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ServiceEntryWithCustomer;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, entry }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (receiptRef.current) {
      window.print();
    } else {
      showError("Gagal mencetak struk. Konten tidak ditemukan.");
    }
  };

  const handleDownload = async () => {
    if (receiptRef.current === null) {
      showError("Gagal mengunduh struk. Konten tidak ditemukan.");
      return;
    }

    try {
      const dataUrl = await toPng(receiptRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `tanda-terima-service-${entry.id}.png`;
      link.href = dataUrl;
      link.click();
      showSuccess("Struk berhasil diunduh!");
    } catch (err) {
      console.error('Gagal membuat gambar struk:', err);
      showError("Gagal mengunduh struk.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tanda Terima Service</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-2">
          <ServiceMasukReceipt ref={receiptRef} entry={{
            id: String(entry.id),
            date: new Date(entry.date),
            customerName: entry.customerName,
            customerPhone: entry.customerPhone,
            category: entry.category,
            deviceType: entry.device_type,
            damageType: entry.damage_type,
            description: entry.description,
          }} />
        </div>
        <DialogFooter className="sm:justify-between gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Tutup</Button>
          <div className="flex gap-2">
            <Button type="button" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Unduh
            </Button>
            <Button type="button" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Cetak
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;