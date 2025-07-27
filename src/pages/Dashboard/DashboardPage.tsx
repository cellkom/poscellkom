import DashboardLayout from "@/components/Layout/DashboardLayout";

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Selamat Datang di Dashboard!</h1>
        <p className="text-gray-600">
          Ini adalah halaman dashboard utama Anda. Di sini Anda dapat melihat ringkasan penjualan, layanan, dan informasi penting lainnya.
        </p>
        <p className="text-gray-600 mt-2">
          Silakan gunakan navigasi di atas untuk menjelajahi fitur-fitur lainnya.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;