import { useState } from "react";
import PublicLayout from "@/components/Layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMemberOrders, MemberOrder, MemberOrderItem } from "@/hooks/use-member-orders";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, Eye, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const getStatusBadgeVariant = (status: MemberOrder['status']) => {
  switch (status) {
    case 'Pending': return 'secondary';
    case 'Processed': return 'default';
    case 'Cancelled': return 'destructive';
    default: return 'outline';
  }
};

const MemberOrdersPage = () => {
  const { orders, loading, fetchOrderDetails } = useMemberOrders();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MemberOrder | null>(null);
  const [orderDetails, setOrderDetails] = useState<MemberOrderItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleViewDetails = async (order: MemberOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
    setDetailLoading(true);
    const details = await fetchOrderDetails(order.id);
    setOrderDetails(details);
    setDetailLoading(false);
  };

  return (
    <>
      <PublicLayout>
        <div className="container mx-auto px-4 md:px-6 py-12">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Daftar Pesanan Saya</CardTitle>
              <p className="text-muted-foreground">Lihat riwayat semua pesanan yang telah Anda buat.</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Pesanan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                  ) : orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.order_number}</TableCell>
                        <TableCell>{format(new Date(order.created_at), "dd MMM yyyy, HH:mm", { locale: id })}</TableCell>
                        <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                        <TableCell><Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge></TableCell>
                        <TableCell className="text-center">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                            <Eye className="h-4 w-4 mr-2" /> Lihat Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">Anda belum memiliki pesanan.</p>
                        <Button asChild variant="link" className="mt-2">
                          <Link to="/products">Mulai Belanja Sekarang</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pesanan {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {orderDetails.map(item => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-3 last:border-0">
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
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MemberOrdersPage;