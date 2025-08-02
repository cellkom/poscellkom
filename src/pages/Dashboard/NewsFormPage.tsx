import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const newsSchema = z.object({
  title: z.string().min(1, "Judul tidak boleh kosong."),
  content: z.string().optional(),
  image: z.any().optional(), // For file input
  image_url: z.string().optional(), // For existing image URL
  status: z.enum(['draft', 'published']),
  published_at: z.date().optional().nullable(),
  slug: z.string().optional(), // Will be generated
});

type NewsFormValues = z.infer<typeof newsSchema>;

const NewsFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      content: "",
      status: "draft",
      published_at: null,
      image_url: "",
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
  const watchedTitle = watch("title");
  const watchedContent = watch("content"); // Watch content as well

  useEffect(() => {
    if (id) {
      fetchNewsItem(id);
    }
  }, [id]);

  useEffect(() => {
    if (watchedTitle) {
      setValue("slug", generateSlug(watchedTitle));
    }
  }, [watchedTitle, setValue]);

  const fetchNewsItem = async (newsId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', newsId)
      .single();

    if (error) {
      console.error("Error fetching news item:", error);
      showError("Gagal memuat data berita.");
      navigate('/dashboard/news');
    } else if (data) {
      setValue("title", data.title);
      setValue("content", data.content || "");
      setValue("status", data.status);
      setValue("published_at", data.published_at ? new Date(data.published_at) : null);
      setValue("slug", data.slug);
      setCurrentImageUrl(data.image_url);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const onSubmit = async (values: NewsFormValues) => {
    setLoading(true);
    let imageUrl = currentImageUrl;

    // Handle image upload if a new file is selected
    if (values.image && values.image.length > 0) {
      const file = values.image[0];
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('news-images') // Ensure this bucket exists in Supabase Storage
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        showError("Gagal mengunggah gambar.");
        setLoading(false);
        return;
      }
      imageUrl = `${supabase.storage.from('news-images').getPublicUrl(fileName).data.publicUrl}`;
    }

    const newsData = {
      title: values.title,
      content: values.content,
      image_url: imageUrl,
      status: values.status,
      published_at: values.published_at ? values.published_at.toISOString() : null,
      slug: values.slug || generateSlug(values.title),
      // author_id: 'current_user_id' // You might want to get the actual user ID here
    };

    if (id) {
      // Update existing news
      const { error } = await supabase
        .from('news')
        .update(newsData)
        .eq('id', id);

      if (error) {
        console.error("Error updating news:", error);
        showError("Gagal memperbarui berita.");
      } else {
        showSuccess("Berita berhasil diperbarui!");
        navigate('/dashboard/news');
      }
    } else {
      // Create new news
      const { error } = await supabase
        .from('news')
        .insert(newsData);

      if (error) {
        console.error("Error creating news:", error);
        showError("Gagal menambahkan berita baru.");
      } else {
        showSuccess("Berita baru berhasil ditambahkan!");
        navigate('/dashboard/news');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">{id ? "Edit Berita" : "Tambah Berita Baru"}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{id ? "Formulir Edit Berita" : "Formulir Berita Baru"}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && id ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Memuat data berita...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="title">Judul Berita</Label>
                <Input id="title" {...register("title")} className="mt-1" />
                {errors.title?.message && <p className="text-red-500 text-sm mt-1">{String(errors.title.message)}</p>}
              </div>

              <div>
                <Label htmlFor="content">Konten Berita</Label>
                <Textarea
                  id="content"
                  {...register("content")}
                  value={watchedContent} // Explicitly set value
                  onChange={(e) => setValue("content", e.target.value)} // Explicitly set onChange
                  className="mt-1 min-h-[150px]"
                />
                {errors.content?.message && <p className="text-red-500 text-sm mt-1">{String(errors.content.message)}</p>}
              </div>

              <div>
                <Label htmlFor="image">Gambar Berita</Label>
                <Input id="image" type="file" {...register("image")} className="mt-1" accept="image/*" />
                {currentImageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">Gambar saat ini:</p>
                    <img src={currentImageUrl} alt="Current News Image" className="w-32 h-32 object-cover rounded-md mt-1" />
                  </div>
                )}
                {errors.image?.message && <p className="text-red-500 text-sm mt-1">{String(errors.image.message)}</p>}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(value: "draft" | "published") => setValue("status", value)} value={watch("status")}>
                  <SelectTrigger className="w-[180px] mt-1">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draf</SelectItem>
                    <SelectItem value="published">Dipublikasikan</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status?.message && <p className="text-red-500 text-sm mt-1">{String(errors.status.message)}</p>}
              </div>

              <div>
                <Label htmlFor="published_at">Tanggal Publikasi (Opsional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal mt-1",
                        !watch("published_at") && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch("published_at") ? format(watch("published_at"), "PPP") : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch("published_at") || undefined}
                      onSelect={(date) => setValue("published_at", date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.published_at?.message && <p className="text-red-500 text-sm mt-1">{String(errors.published_at.message)}</p>}
              </div>

              <div>
                <Label htmlFor="slug">Slug (Otomatis)</Label>
                <Input id="slug" value={watch("slug") || ''} readOnly className="mt-1 bg-gray-100" />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard/news')}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {id ? "Perbarui Berita" : "Tambah Berita"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default NewsFormPage;