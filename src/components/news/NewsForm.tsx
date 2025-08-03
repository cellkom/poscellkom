import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { News } from '@/hooks/use-news';

interface NewsFormProps {
  initialData?: News | null;
  onSubmit: (data: Omit<News, 'id' | 'created_at' | 'updated_at' | 'author_id'>, imageFile: File | null, oldImageUrl: string | null) => Promise<boolean>;
  isLoading: boolean;
  onCancel: () => void;
}

const NewsForm: React.FC<NewsFormProps> = ({ initialData, onSubmit, isLoading, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(initialData?.image_url || null);
  const [status, setStatus] = useState<'draft' | 'published'>(initialData?.status || 'draft');
  const [publishedAt, setPublishedAt] = useState<Date | undefined>(initialData?.published_at ? new Date(initialData.published_at) : undefined);
  const [slug, setSlug] = useState(initialData?.slug || '');

  useEffect(() => {
    if (title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''));
    } else {
      setSlug('');
    }
  }, [title]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrlPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrlPreview(null);
    // Clear the file input value
    const fileInput = document.getElementById('image_url') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(
      {
        title,
        content,
        slug,
        status,
        published_at: publishedAt ? publishedAt.toISOString() : null,
        image_url: imageUrlPreview, // Pass current preview as image_url for update logic
      },
      imageFile,
      initialData?.image_url || null // Pass the original image URL for deletion logic
    );
    if (success) {
      onCancel(); // Close dialog on success
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Judul</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" value={slug} readOnly className="bg-gray-100" />
      </div>
      <div>
        <Label htmlFor="content">Konten</Label>
        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={5} />
      </div>
      <div>
        <Label htmlFor="image_url">Gambar</Label>
        <Input id="image_url" type="file" accept="image/*" onChange={handleImageChange} />
        {imageUrlPreview && (
          <div className="mt-2 relative w-32 h-32">
            <img src={imageUrlPreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleRemoveImage}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {status === 'published' && (
        <div>
          <Label htmlFor="published_at">Tanggal Publikasi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !publishedAt && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {publishedAt ? format(publishedAt, "PPP") : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={publishedAt}
                onSelect={setPublishedAt}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Perbarui' : 'Tambah'} Berita
        </Button>
      </div>
    </form>
  );
};

export default NewsForm;