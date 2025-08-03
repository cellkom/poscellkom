import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewsForm from './NewsForm';
import { useNews } from '@/hooks/use-news';

interface AddNewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddNewsDialog: React.FC<AddNewsDialogProps> = ({ open, onOpenChange, onSuccess }) => {
  const { addNews, loading } = useNews();

  const handleSubmit = async (data: any, imageFile: File | null) => {
    const success = await addNews(data, imageFile);
    if (success) {
      onSuccess();
    }
    return success;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tambah Berita Baru</DialogTitle>
        </DialogHeader>
        <NewsForm onSubmit={handleSubmit} isLoading={loading} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};