import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const PublicPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Selamat Datang!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
          Ini adalah halaman publik yang bisa diakses siapa saja.
        </p>
        <Button asChild>
          <Link to="/login">
            Masuk ke Aplikasi
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PublicPage;