import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewsForm from './NewsForm';
import { News, useNews } from '@/hooks/use-news';

interface EditNewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  newsEntry: News | null;
}

export const EditNewsDialog: React.FC<EditNewsDialogProps> = ({ open, onOpenChange, onSuccess, newsEntry }) => {
  const { updateNews, loading } = useNews();

  const handleSubmit = async (data: any, imageFile: File | null, oldImageUrl: string | null) => {
    if (!newsEntry) return false;
    const success = await updateNews(newsEntry.id, data, imageFile, oldImageUrl);
    if (success) {
      onSuccess();
    }
    return success;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Berita</DialogTitle>
        </DialogHeader>
        {newsEntry && (
          <NewsForm
            initialData={newsEntry}
            onSubmit={handleSubmit}
            isLoading={loading}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};