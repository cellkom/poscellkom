import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrders, Order, OrderItem } from "@/hooks/use-orders";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, Eye, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const getStatusBadgeVariant = (status: Order['status']) => {
  switch (status) {
    case 'Pending': return 'secondary';
    case 'Processed': return 'default';
    case 'Cancelled': return 'destructive';
    default: return 'outline';
  }
};

const OrderManagementPage = () => {
  const { orders, loading, updateOrderStatus, fetchOrderDetails, deleteOrder } = useOrders();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
    setDetailLoading(true);
    const details = await fetchOrderDetails(order.id);
    setOrderDetails(details);
    setDetailLoading(false);
  };

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
  };

  const handleDelete = async () => {
    if (orderToDelete) {
      await deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Pesanan</CardTitle>
          <p className="text-muted-foreground">Kelola pesanan yang masuk dari pelanggan member.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Pesanan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.order_number}</TableCell>
                    <TableCell>{format(new Date(order.created_at), "dd MMM yyyy, HH:mm", { locale: id })}</TableCell>
                    <TableCell>{order.members?.full_name || 'Member Dihapus'}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])}>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending"><Badge variant="secondary" className="mr-2" />Pending</SelectItem>
                          <SelectItem value="Processed"><Badge variant="default" className="mr-2" />Processed</SelectItem>
                          <SelectItem value="Cancelled"><Badge variant="destructive" className="mr-2" />Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                          <Eye className="h-4 w-4 mr-2" /> Detail
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setOrderToDelete(order)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Belum ada pesanan.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pesanan {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {selectedOrder?.members ? (
                <div>
                  <h4 className="font-semibold mb-2">Informasi Pelanggan</h4>
                  <div className="text-sm space-y-1 text-muted-foreground p-3 bg-muted rounded-md">
                    <p><strong>Nama:</strong> {selectedOrder.members.full_name}</p>
                    <p><strong>Telepon:</strong> {selectedOrder.members.phone || '-'}</p>
                    <p><strong>Alamat:</strong> {selectedOrder.members.address || '-'}</p>
                  </div>
                </div>
              ) : (
                 <div>
                  <h4 className="font-semibold mb-2">Informasi Pelanggan</h4>
                  <div className="text-sm p-3 bg-destructive/10 text-destructive rounded-md">
                    <p>Data member untuk pesanan ini telah dihapus.</p>
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-semibold mb-2">Item Pesanan</h4>
                <div className="space-y-4">
                  {orderDetails.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                        <img src={item.products.image_url || '/placeholder.svg'} alt={item.products.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium">{item.products.name}</p>
                        <p className="text-sm text-muted-foreground">{item.quantity} x {formatCurrency(item.price_at_order)}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.quantity * item.price_at_order)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus pesanan dengan nomor {orderToDelete?.order_number} secara permanen. Aksi ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OrderManagementPage;