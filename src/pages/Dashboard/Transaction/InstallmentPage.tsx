import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const InstallmentPage = () => {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Kelola Cicilan (Hutang Piutang)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Sistem untuk memantau cicilan yang belum lunas, mencatat pembayaran, dan melihat riwayat pembayaran akan dikembangkan di sini.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default InstallmentPage;