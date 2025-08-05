import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useNews, NewsArticle } from "@/hooks/use-news";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

interface NewsFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  article: NewsArticle | null;
}

const NewsFormDialog = ({ isOpen, onClose, onSaveSuccess, article }: NewsFormDialogProps) => {
  const { user } = useAuth();
  const { uploadNewsImage } = useNews();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content || '');
      setSlug(article.slug);
      setStatus(article.status);
      setImagePreview(article.image_url);
      setImageFile(null); // Reset file input on open
    } else {
      // Reset form for new article
      setTitle('');
      setContent('');
      setSlug('');
      setStatus('draft');
      setImageFile(null);
      setImagePreview(null);
    }
  }, [article, isOpen]);

  const generateSlug = (str: string) => {
    return str
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Only auto-generate slug if it's a new article or the slug was empty
    if (!article || !article.slug) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!title || !content || !slug) {
      showError('Judul, konten, dan slug wajib diisi.');
      return;
    }
    if (!user) {
      showError('Sesi pengguna tidak valid.');
      return;
    }

    setIsSubmitting(true);

    let imageUrl = article?.image_url || null;
    if (imageFile) {
      const uploadedUrl = await uploadNewsImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        setIsSubmitting(false);
        return;
      }
    }

    const articleData = {
      title,
      content,
      slug,
      status,
      image_url: imageUrl,
      author_id: user.id,
      published_at: status === 'published' && (!article || !article.published_at) ? new Date().toISOString() : article?.published_at,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (article) {
      // Update existing article
      const { error: updateError } = await supabase
        .from('news')
        .update(articleData)
        .eq('id', article.id);
      error = updateError;
    } else {
      // Create new article
      const { error: insertError } = await supabase
        .from('news')
        .insert(articleData);
      error = insertError;
    }

    setIsSubmitting(false);

    if (error) {
      showError(`Gagal menyimpan berita: ${error.message}`);
    } else {
      showSuccess(`Berita berhasil ${article ? 'diperbarui' : 'dibuat'}!`);
      onSaveSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{article ? 'Edit Berita' : 'Tambah Berita Baru'}</DialogTitle>
          <DialogDescription>
            Isi detail berita di bawah ini. Klik simpan jika sudah selesai.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" value={title} onChange={handleTitleChange} placeholder="Judul berita yang menarik" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="contoh-slug-berita" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Konten</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Tulis isi berita di sini..." rows={10} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Gambar Utama</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-40 w-auto object-cover rounded-md border" />}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Diterbitkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="button" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewsFormDialog;