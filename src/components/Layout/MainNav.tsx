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

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
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
      className={cn("flex flex-col gap-1 text-sm font-medium p-2", className)}
      {...props}
    >
      <Link
        to="/dashboard"
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
          isActive("/dashboard") && location.pathname === '/dashboard' ? "bg-muted text-primary" : "text-muted-foreground"
        )}
      >
        <Home className="h-4 w-4" />
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
          <AccordionTrigger className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180", isParentActive(transactionPaths) ? "text-primary" : "text-muted-foreground")}>
            <ClipboardList className="h-4 w-4" />
            <span>Transaksi</span>
          </AccordionTrigger>
          <AccordionContent className="pl-8 space-y-1 mt-1">
            <Link to="/dashboard/transaction/sales" className={cn("block rounded-md py-2 px-3 text-sm", isActive("/dashboard/transaction/sales") ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5")}>Penjualan</Link>
            <Link to="/dashboard/transaction/service" className={cn("block rounded-md py-2 px-3 text-sm", isActive("/dashboard/transaction/service") ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5")}>Service Keluar</Link>
            <Link to="/dashboard/service-masuk" className={cn("block rounded-md py-2 px-3 text-sm", isActive("/dashboard/service-masuk") ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5")}>Service Masuk</Link>
            <Link to="/dashboard/transaction/installments" className={cn("block rounded-md py-2 px-3 text-sm", isActive("/dashboard/transaction/installments") ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5")}>Cicilan</Link>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="data-master" className="border-b-0">
          <AccordionTrigger className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180", isParentActive(dataMasterPaths) ? "text-primary" : "text-muted-foreground")}>
            <Database className="h-4 w-4" />
            <span>Data Master</span>
          </AccordionTrigger>
          <AccordionContent className="pl-8 space-y-1 mt-1">
            <Link to="/dashboard/stock" className={cn("block rounded-md py-2 px-3 text-sm", isActive("/dashboard/stock") ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5")}>Stok Barang</Link>
            <Link to="/dashboard/data/customers" className={cn("block rounded-md py-2 px-3 text-sm", isActive("/dashboard/data/customers") ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5")}>Pelanggan</Link>
            <Link to="/dashboard/data/suppliers" className={cn("block rounded-md py-2 px-3 text-sm", isActive("/dashboard/data/suppliers") ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5")}>Supplier</Link>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="laporan" className="border-b-0">
          <AccordionTrigger className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180", isParentActive(reportsPaths) ? "text-primary" : "text-muted-foreground")}>
            <FileText className="h-4 w-4" />
            <span>Laporan</span>
          </AccordionTrigger>
          <AccordionContent className="pl-8 space-y-1 mt-1">
            <Link to="/dashboard/reports" className={cn("block rounded-md py-2 px-3 text-sm", isActive("/dashboard/reports") && location.pathname === '/dashboard/reports' ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5")}>Ringkasan</Link>
            <Link to="/dashboard/reports/sales" className={cn("block rounded-md py-2 px-3 text-sm", isActive("/dashboard/reports/sales") ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5")}>Laporan Penjualan</Link>
            <Link to="/dashboard/reports/service" className={cn("block rounded-md py-2 px-3 text-sm", isActive("/dashboard/reports/service") ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5")}>Laporan Service</Link>
          </AccordionContent>
        </AccordionItem>

        {profile?.role === 'Admin' && (
          <AccordionItem value="pengaturan" className="border-b-0">
            <AccordionTrigger className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180", isParentActive(settingsPaths) ? "text-primary" : "text-muted-foreground")}>
              <Cog className="h-4 w-4" />
              <span>Pengaturan</span>
            </AccordionTrigger>
            <AccordionContent className="pl-8 space-y-1 mt-1">
              <Link to="/dashboard/users" className={cn("block rounded-md py-2 px-3 text-sm", isActive("/dashboard/users") ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5")}>Manajemen User</Link>
              <Link to="/dashboard/settings" className={cn("block rounded-md py-2 px-3 text-sm", isActive("/dashboard/settings") ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5")}>Pengaturan Toko</Link>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </nav>
  );
}