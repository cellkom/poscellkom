import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/types";

const formSchema = z.object({
  name: z.string().min(1, "Nama produk harus diisi."),
  category: z.string().optional().nullable(),
  stock: z.coerce.number({ invalid_type_error: "Stok harus berupa angka." }).int().min(0, "Stok tidak boleh negatif."),
  buy_price: z.coerce.number({ invalid_type_error: "Harga harus berupa angka." }).min(0, "Harga beli tidak boleh negatif."),
  retail_price: z.coerce.number({ invalid_type_error: "Harga harus berupa angka." }).min(0, "Harga eceran tidak boleh negatif."),
  reseller_price: z.coerce.number({ invalid_type_error: "Harga harus berupa angka." }).min(0, "Harga reseller tidak boleh negatif."),
  barcode: z.string().optional().nullable(),
  supplier_id: z.string().uuid().optional().nullable(),
  image_url: z.string().url("URL gambar tidak valid.").optional().nullable(),
  description: z.string().optional().nullable(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      category: product?.category || "",
      stock: product?.stock || 0,
      buy_price: product?.buy_price || 0,
      retail_price: product?.retail_price || 0,
      reseller_price: product?.reseller_price || 0,
      barcode: product?.barcode || "",
      supplier_id: product?.supplier_id || null,
      image_url: product?.image_url || "",
      description: product?.description || "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: categoriesData } = await supabase.from("products").select("category").neq("category", "");
      if (categoriesData) {
        const uniqueCategories = [...new Set(categoriesData.map(p => p.category).filter(Boolean) as string[])];
        setCategories(uniqueCategories);
      }

      const { data: suppliersData } = await supabase.from("suppliers").select("id, name");
      if (suppliersData) {
        setSuppliers(suppliersData);
      }
    };
    fetchData();
  }, []);

  const filteredCategories = categorySearch
    ? categories.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()))
    : categories;
  
  const showCreateCategoryOption = categorySearch && !categories.some(c => c.toLowerCase() === categorySearch.toLowerCase());

  async function onSubmit(values: ProductFormValues) {
    setIsSubmitting(true);
    const { error } = product
      ? await supabase.from("products").update(values).eq("id", product.id)
      : await supabase.from("products").insert([values]);

    if (error) {
      toast.error(`Gagal ${product ? "memperbarui" : "menambahkan"} produk. Error: ${error.message}`);
    } else {
      toast.success(`Produk berhasil ${product ? "diperbarui" : "ditambahkan"}!`);
      onSuccess();
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 pr-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Produk</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Baterai iPhone X" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Kategori</FormLabel>
              <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      {field.value || "Pilih atau buat kategori baru"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Cari atau buat kategori..."
                      onValueChange={setCategorySearch}
                      value={categorySearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {showCreateCategoryOption ? 'Tekan enter untuk membuat kategori baru.' : 'Kategori tidak ditemukan.'}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredCategories.map((category) => (
                          <CommandItem
                            value={category}
                            key={category}
                            onSelect={() => {
                              form.setValue("category", category);
                              setIsCategoryPopoverOpen(false);
                              setCategorySearch("");
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", category === field.value ? "opacity-100" : "opacity-0")} />
                            {category}
                          </CommandItem>
                        ))}
                        {showCreateCategoryOption && (
                           <CommandItem
                            onSelect={() => {
                              const newCategory = categorySearch.trim();
                              form.setValue("category", newCategory);
                              if (!categories.includes(newCategory)) {
                                setCategories(prev => [...prev, newCategory]);
                              }
                              setIsCategoryPopoverOpen(false);
                              setCategorySearch("");
                            }}
                           >
                            <span className="mr-2 h-4 w-4" />
                            Buat kategori: "{categorySearch}"
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stok</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode (Opsional)</FormLabel>
                <FormControl>
                  <Input placeholder="Kode barcode produk" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="buy_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Beli</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="retail_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Eceran</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reseller_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Reseller</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="supplier_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Supplier (Opsional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? suppliers.find((s) => s.id === field.value)?.name : "Pilih supplier"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Cari supplier..." />
                    <CommandList>
                      <CommandEmpty>Supplier tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {suppliers.map((supplier) => (
                          <CommandItem
                            value={supplier.name}
                            key={supplier.id}
                            onSelect={() => {
                              form.setValue("supplier_id", supplier.id);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", supplier.id === field.value ? "opacity-100" : "opacity-0")} />
                            {supplier.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Gambar (Opsional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat produk" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
          </Button>
        </div>
      </form>
    </Form>
  );
}