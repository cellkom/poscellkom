import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ServicePage = () => {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Jasa Service</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Fitur untuk mencatat transaksi jasa service, penggunaan sparepart, dan manajemen status service akan dikembangkan di sini.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ServicePage;