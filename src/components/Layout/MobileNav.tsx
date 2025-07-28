import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Home,
  ClipboardList,
  Database,
  FileText,
  Cog,
} from "lucide-react";

export function MobileNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const location = useLocation();
  const { profile } = useAuth();

  const isActive = (path: string) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
  
  const isParentActive = (paths: string[]) => paths.some(path => location.pathname.startsWith(path));

  const transactionPaths = ["/dashboard/transaction", "/dashboard/service-masuk"];
  const dataMasterPaths = ["/dashboard/stock", "/dashboard/data"];
  const reportsPaths = ["/dashboard/reports"];
  const settingsPaths = ["/dashboard/users", "/dashboard/settings"];

  return (
    <nav
      className={cn("flex flex-col gap-2 text-lg font-medium", className)}
      {...props}
    >
      <Link
        to="/dashboard"
        className={cn(
          "flex items-center gap-4 px-2.5",
          isActive("/dashboard") && location.pathname === '/dashboard' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Home className="h-5 w-5" />
        Dashboard
      </Link>

      <Accordion type="multiple" className="w-full" defaultValue={
          [
              isParentActive(transactionPaths) ? "transaksi" : "",
              isParentActive(dataMasterPaths) ? "data-master" : "",
              isParentActive(reportsPaths) ? "laporan" : "",
              isParentActive(settingsPaths) ? "pengaturan" : "",
          ].filter(Boolean)
      }>
        <AccordionItem value="transaksi" className="border-b-0">
          <AccordionTrigger className={cn("flex items-center gap-4 px-2.5 hover:text-foreground [&[data-state=open]>svg]:rotate-180", isParentActive(transactionPaths) ? "text-foreground" : "text-muted-foreground")}>
            <ClipboardList className="h-5 w-5" />
            <span>Transaksi</span>
          </AccordionTrigger>
          <AccordionContent className="pl-10 space-y-2 mt-1">
            <Link to="/dashboard/transaction/sales" className={cn("block rounded-md py-2 px-3 text-base", isActive("/dashboard/transaction/sales") ? "text-foreground font-semibold" : "text-muted-foreground")}>Penjualan</Link>
            <Link to="/dashboard/transaction/service" className={cn("block rounded-md py-2 px-3 text-base", isActive("/dashboard/transaction/service") ? "text-foreground font-semibold" : "text-muted-foreground")}>Service Keluar</Link>
            <Link to="/dashboard/service-masuk" className={cn("block rounded-md py-2 px-3 text-base", isActive("/dashboard/service-masuk") ? "text-foreground font-semibold" : "text-muted-foreground")}>Service Masuk</Link>
            <Link to="/dashboard/transaction/installments" className={cn("block rounded-md py-2 px-3 text-base", isActive("/dashboard/transaction/installments") ? "text-foreground font-semibold" : "text-muted-foreground")}>Cicilan</Link>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="data-master" className="border-b-0">
          <AccordionTrigger className={cn("flex items-center gap-4 px-2.5 hover:text-foreground [&[data-state=open]>svg]:rotate-180", isParentActive(dataMasterPaths) ? "text-foreground" : "text-muted-foreground")}>
            <Database className="h-5 w-5" />
            <span>Data Master</span>
          </AccordionTrigger>
          <AccordionContent className="pl-10 space-y-2 mt-1">
            <Link to="/dashboard/stock" className={cn("block rounded-md py-2 px-3 text-base", isActive("/dashboard/stock") ? "text-foreground font-semibold" : "text-muted-foreground")}>Stok Barang</Link>
            <Link to="/dashboard/data/customers" className={cn("block rounded-md py-2 px-3 text-base", isActive("/dashboard/data/customers") ? "text-foreground font-semibold" : "text-muted-foreground")}>Pelanggan</Link>
            <Link to="/dashboard/data/suppliers" className={cn("block rounded-md py-2 px-3 text-base", isActive("/dashboard/data/suppliers") ? "text-foreground font-semibold" : "text-muted-foreground")}>Supplier</Link>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="laporan" className="border-b-0">
          <AccordionTrigger className={cn("flex items-center gap-4 px-2.5 hover:text-foreground [&[data-state=open]>svg]:rotate-180", isParentActive(reportsPaths) ? "text-foreground" : "text-muted-foreground")}>
            <FileText className="h-5 w-5" />
            <span>Laporan</span>
          </AccordionTrigger>
          <AccordionContent className="pl-10 space-y-2 mt-1">
            <Link to="/dashboard/reports" className={cn("block rounded-md py-2 px-3 text-base", isActive("/dashboard/reports") && location.pathname === '/dashboard/reports' ? "text-foreground font-semibold" : "text-muted-foreground")}>Ringkasan</Link>
            <Link to="/dashboard/reports/sales" className={cn("block rounded-md py-2 px-3 text-base", isActive("/dashboard/reports/sales") ? "text-foreground font-semibold" : "text-muted-foreground")}>Laporan Penjualan</Link>
            <Link to="/dashboard/reports/service" className={cn("block rounded-md py-2 px-3 text-base", isActive("/dashboard/reports/service") ? "text-foreground font-semibold" : "text-muted-foreground")}>Laporan Service</Link>
          </AccordionContent>
        </AccordionItem>

        {profile?.role === 'Admin' && (
          <AccordionItem value="pengaturan" className="border-b-0">
            <AccordionTrigger className={cn("flex items-center gap-4 px-2.5 hover:text-foreground [&[data-state=open]>svg]:rotate-180", isParentActive(settingsPaths) ? "text-foreground" : "text-muted-foreground")}>
              <Cog className="h-5 w-5" />
              <span>Pengaturan</span>
            </AccordionTrigger>
            <AccordionContent className="pl-10 space-y-2 mt-1">
              <Link to="/dashboard/users" className={cn("block rounded-md py-2 px-3 text-base", isActive("/dashboard/users") ? "text-foreground font-semibold" : "text-muted-foreground")}>Manajemen User</Link>
              <Link to="/dashboard/settings" className={cn("block rounded-md py-2 px-3 text-base", isActive("/dashboard/settings") ? "text-foreground font-semibold" : "text-muted-foreground")}>Pengaturan Toko</Link>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </nav>
  );
}