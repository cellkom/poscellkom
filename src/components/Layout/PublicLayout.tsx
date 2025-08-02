import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronDown } from "lucide-react";
import logoSrc from '/logo.png';
import { ThemeToggle } from "../ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface NavLink {
  name: string;
  href?: string;
  isDropdown?: boolean;
  subItems?: { name: string; href: string }[];
}

const navLinks: NavLink[] = [
  { name: "Home", href: "/" },
  { 
    name: "Layanan", 
    isDropdown: true,
    subItems: [
      { name: "Service", href: "/layanan/service" },
      { name: "IT", href: "/layanan/it" }
    ]
  },
  { name: "Tentang Kami", href: "/#about" },
  { name: "Kontak", href: "/#contact" },
];

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoSrc} alt="Cellkom.Store Logo" className="h-12 w-auto" />
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-primary font-poppins">Cellkom.Store</h1>
              <p className="text-xs text-muted-foreground -mt-1">Pusat Service HP dan Komputer</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map(link => (
              link.isDropdown ? (
                <DropdownMenu key={link.name}>
                  <DropdownMenuTrigger className="flex items-center text-muted-foreground transition-colors hover:text-primary focus:outline-none">
                    {link.name}
                    <ChevronDown className="relative top-[1px] ml-1 h-4 w-4 transition duration-200" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {link.subItems?.map(subItem => (
                      <DropdownMenuItem key={subItem.name} asChild>
                        <Link to={subItem.href}>{subItem.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link key={link.name} to={link.href!} className="text-muted-foreground transition-colors hover:text-primary">
                  {link.name}
                </Link>
              )
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link to="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <img src={logoSrc} alt="Cellkom.Store Logo" className="h-10 w-auto" />
                    <span className="sr-only">Cellkom.Store</span>
                  </Link>
                  {navLinks.map(link => (
                     link.isDropdown ? (
                        <div key={link.name} className="flex flex-col">
                           <span className="text-muted-foreground">{link.name}</span>
                           <div className="pl-4 mt-2 space-y-4">
                            {link.subItems?.map(subItem => (
                              <Link key={subItem.name} to={subItem.href} className="block text-muted-foreground hover:text-primary">
                                {subItem.name}
                              </Link>
                            ))}
                           </div>
                        </div>
                      ) : (
                        <Link key={link.name} to={link.href!} className="text-muted-foreground hover:text-primary">
                          {link.name}
                        </Link>
                      )
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="border-t">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Cellkom.Store. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;