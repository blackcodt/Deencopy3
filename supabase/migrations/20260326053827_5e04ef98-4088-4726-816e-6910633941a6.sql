
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL DEFAULT '',
  file_name text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.book_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  chapter_number integer NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read books" ON public.books FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert books" ON public.books FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update books" ON public.books FOR UPDATE TO public USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete books" ON public.books FOR DELETE TO public USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can read chapters" ON public.book_chapters FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert chapters" ON public.book_chapters FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete chapters" ON public.book_chapters FOR DELETE TO public USING (auth.role() = 'authenticated');
