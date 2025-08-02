import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
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
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface News {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string | null;
  image_url: string | null;
  slug: string;
  status: 'draft' | 'published';
  published_at: string | null;
  author_id: string | null;
}

const NewsManagementPage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newsToDelete, setNewsToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching news:", error);
      setError("Gagal memuat berita.");
      showError("Gagal memuat berita.");
    } else {
      setNews(data as News[]);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;

    setLoading(true);
    const { data: newsItem, error: fetchError } = await supabase
      .from('news')
      .select('image_url')
      .eq('id', newsToDelete)
      .single();

    if (fetchError) {
      console.error("Error fetching news item for deletion:", fetchError);
      showError("Gagal menghapus berita: Tidak dapat mengambil detail berita.");
      setLoading(false);
      setNewsToDelete(null);
      return;
    }

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', newsToDelete);

    if (error) {
      console.error("Error deleting news:", error);
      showError("Gagal menghapus berita.");
    } else {
      // If there was an image, delete it from storage
      if (newsItem?.image_url) {
        const imageUrlParts = newsItem.image_url.split('/');
        const fileName = imageUrlParts[imageUrlParts.length - 1];
        const { error: storageError } = await supabase.storage
          .from('news-images') // Assuming a bucket named 'news-images'
          .remove([fileName]);

        if (storageError) {
          console.error("Error deleting image from storage:", storageError);
          showError("Berita berhasil dihapus, tetapi gagal menghapus gambar terkait.");
        } else {
          showSuccess("Berita dan gambar terkait berhasil dihapus!");
        }
      } else {
        showSuccess("Berita berhasil dihapus!");
      }
      fetchNews(); // Re-fetch news after deletion
    }
    setLoading(false);
    setNewsToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat berita...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        <p>{error}</p>
        <Button onClick={fetchNews} className="mt-4">Coba Lagi</Button>
      </div>
    );
  } // Removed extra closing parenthesis and semicolon here

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manajemen Berita</h1>
        <Button asChild>
          <Link to="/dashboard/news/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Berita Baru
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Berita</CardTitle>
        </CardHeader>
        <CardContent>
          {news.length === 0 ? (
            <p className="text-center text-muted-foreground">Belum ada berita. Tambahkan yang pertama!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Publikasi</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {news.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.status === 'published' ? 'Dipublikasikan' : 'Draf'}</TableCell>
                    <TableCell>
                      {item.published_at ? format(new Date(item.published_at), 'd MMMM yyyy', { locale: id }) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link to={`/dashboard/news/edit/${item.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" onClick={() => setNewsToDelete(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus berita "{item.title}" secara permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setNewsToDelete(null)}>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default NewsManagementPage;