import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export const GlobalSearchInput = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    // Syncs the input field if the user navigates with back/forward buttons
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full flex">
      <div className="relative w-full">
        <Input
          type="search"
          placeholder="Cari servis, produk, dan lainnya..."
          className="pr-12 h-10 border-primary/50 focus-visible:ring-primary/20"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" size="icon" className="absolute right-0 top-0 h-10 w-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-l-none">
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};