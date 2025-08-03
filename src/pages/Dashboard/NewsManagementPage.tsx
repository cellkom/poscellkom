import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError } from "@/utils/toast";
import { format } from "date-fns";
import { useNews, NewsArticle } from "@/hooks/use-news";

const NewsManagementPage = () => {
  const { user } = useAuth();
  const { articles, loading, fetchArticles, addArticle, updateArticle, deleteArticle } = useNews();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', status: 'draft' as 'draft' | 'published', slug: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles(true); // Fetch all articles for admin
  }, [fetchArticles]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: generateSlug(newTitle)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOpenDialog = (article: NewsArticle | null = null) => {
    setEditingArticle(article);
    if (article) {
      setFormData({
        title: article.title,
        content: article.content,
        status: article.status,
        slug: article.slug,
      });
      setImagePreview(article.image_url);
    } else {
      setFormData({ title: '', content: '', status: 'draft', slug: '' });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.slug) {
      showError("Judul, konten, dan slug wajib diisi.");
      return;
    }
    if (!user) {
      showError("Sesi pengguna tidak ditemukan.");
      return;
    }

    setIsSubmitting(true);
    
    const articlePayload = {
      title: formData.title,
      content: formData.content,
      slug: formData.slug,
      status: formData.status,
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
      author_id: user.id,
    };

    let success = false;
    if (editingArticle) {
      success = await updateArticle(editingArticle.id, articlePayload, imageFile);
    } else {
      success = await addArticle(articlePayload, imageFile);
    }

    setIsSubmitting(false);
    if (success) {
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (articleId: string) => {
    if (window.confirm("Anda yakin ingin menghapus berita ini?")) {
      await deleteArticle(articleId);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Manajemen Berita</CardTitle>
          <Button onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4" /> Tulis Berita Baru</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Judul</TableHead><TableHead>Status</TableHead><TableHead>Tanggal Publikasi</TableHead><TableHead className="text-center">Aksi</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
              ) : articles.map(article => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell><Badge variant={article.status === 'published' ? 'default' : 'secondary'}>{article.status}</Badge></TableCell>
                  <TableCell>{article.published_at ? format(new Date(article.published_at), 'dd MMM yyyy') : '-'}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(article)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(article.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader><DialogTitle>{editingArticle ? 'Edit Berita' : 'Tulis Berita Baru'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul</Label>
                <Input id="title" value={formData.title} onChange={handleTitleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input id="slug" value={formData.slug} onChange={(e) => setFormData(p => ({...p, slug: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Konten</Label>
                <Textarea id="content" value={formData.content} onChange={(e) => setFormData(p => ({...p, content: e.target.value}))} rows={10} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Gambar Utama</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-auto object-cover rounded-md border" />}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v: 'draft' | 'published') => setFormData(p => ({...p, status: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewsManagementPage;