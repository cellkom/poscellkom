import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Image as ImageIcon, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNews, NewsArticle } from "@/hooks/use-news";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import NewsFormDialog from '@/components/Dashboard/NewsFormDialog';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const NewsManagementPage = () => {
  const { articles, loading, fetchArticles } = useNews();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    // Fetch articles in admin mode to get both drafts and published
    fetchArticles(true);
  }, [fetchArticles]);

  const handleAdd = () => {
    setSelectedArticle(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsDialogOpen(true);
  };

  const handleSaveSuccess = () => {
    setIsDialogOpen(false);
    // Refetch articles in admin mode to show the latest changes
    fetchArticles(true);
  };

  const handleDelete = async (articleId: string) => {
    const { error } = await supabase.from('news').delete().eq('id', articleId);
    if (error) {
      showError(`Gagal menghapus berita: ${error.message}`);
    } else {
      showSuccess('Berita berhasil dihapus.');
      // Refetch articles to update the list
      fetchArticles(true);
    }
  };

  const handleToggleStatus = async (article: NewsArticle) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    const newPublishedAt = newStatus === 'published' && !article.published_at ? new Date().toISOString() : article.published_at;

    const { error } = await supabase
      .from('news')
      .update({ status: newStatus, published_at: newPublishedAt })
      .eq('id', article.id);

    if (error) {
      showError(`Gagal mengubah status: ${error.message}`);
    } else {
      showSuccess(`Status berita berhasil diubah menjadi ${newStatus}.`);
      fetchArticles(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Berita</h1>
          <p className="text-muted-foreground">Buat, edit, dan kelola semua berita dan informasi.</p>
        </div>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Berita
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Berita</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Gambar</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Publikasi</TableHead>
                <TableHead>Tanggal Update</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : articles.length > 0 ? (
                articles.map(article => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                        {article.image_url ? (
                          <img src={article.image_url} alt={article.title} className="h-full w-full object-cover rounded-md" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>
                      <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                        {article.status === 'published' ? 'Diterbitkan' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {article.published_at ? format(new Date(article.published_at), 'd MMM yyyy', { locale: id }) : '-'}
                    </TableCell>
                    <TableCell>{format(new Date(article.updated_at), 'd MMM yyyy', { locale: id })}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(article)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(article)}>
                              {article.status === 'published' ? (
                                <ToggleLeft className="mr-2 h-4 w-4" />
                              ) : (
                                <ToggleRight className="mr-2 h-4 w-4" />
                              )}
                              <span>{article.status === 'published' ? 'Jadikan Draft' : 'Terbitkan'}</span>
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Hapus</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus berita secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(article.id)} className="bg-red-600 hover:bg-red-700">
                              Ya, Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Belum ada berita.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewsFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSaveSuccess={handleSaveSuccess}
        article={selectedArticle}
      />
    </div>
  );
};

export default NewsManagementPage;