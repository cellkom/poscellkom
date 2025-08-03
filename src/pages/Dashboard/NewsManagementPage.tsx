import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Loader2, Eye } from 'lucide-react';
import { useNews, News } from '@/hooks/use-news';
import { AddNewsDialog } from '@/components/news/AddNewsDialog';
import { EditNewsDialog } from '@/components/news/EditNewsDialog';
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
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const NewsManagementPage: React.FC = () => {
  const { news, loading, fetchNews, deleteNews } = useNews();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newsToDelete, setNewsToDelete] = useState<News | null>(null);

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    fetchNews();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingNews(null);
    fetchNews();
  };

  const handleDelete = async () => {
    if (newsToDelete) {
      await deleteNews(newsToDelete.id, newsToDelete.image_url);
      setNewsToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Memuat berita...</p>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Manajemen Berita</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Berita Baru
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Publikasi</TableHead>
                <TableHead>Gambar</TableHead>
                <TableHead>Penulis</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Tidak ada berita yang tersedia.</TableCell>
                </TableRow>
              ) : (
                news.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                        {item.status === 'published' ? 'Dipublikasikan' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.published_at ? format(new Date(item.published_at), 'd MMMM yyyy', { locale: id }) : '-'}
                    </TableCell>
                    <TableCell>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded-md" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{item.author_id || 'N/A'}</TableCell> {/* Placeholder for author name */}
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                          setEditingNews(item);
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setNewsToDelete(item)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus berita "{newsToDelete?.title}" secara permanen.
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddNewsDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleAddSuccess}
      />
      {editingNews && (
        <EditNewsDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
          newsEntry={editingNews}
        />
      )}
    </>
  );
};

export default NewsManagementPage;