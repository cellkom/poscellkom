import { Link, useLocation } from 'react-router-dom';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isMobile?: boolean;
}

const NavLink = ({ to, icon: Icon, label, isMobile = false }: NavLinkProps) => {
  const location = useLocation();
  // Gunakan startsWith agar link tetap aktif untuk sub-halaman
  const isActive = location.pathname === to || (location.pathname.startsWith(to) && to !== '/dashboard');

  const baseClasses = "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary";
  const activeClasses = "bg-muted text-primary font-semibold";
  const mobileClasses = "gap-4 text-base";

  return (
    <Link
      to={to}
      className={cn(
        baseClasses,
        isActive && activeClasses,
        isMobile && mobileClasses
      )}
    >
      <Icon className={cn("h-5 w-5", isMobile && "h-6 w-6")} />
      <span className="flex-1">{label}</span>
    </Link>
  );
};

export default NavLink;