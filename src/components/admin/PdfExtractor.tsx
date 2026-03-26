import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2, Copy, Check, Save, Database, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ExtractedChapter {
  title: string;
  content: string[];
}

export function PdfExtractor() {
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [chapters, setChapters] = useState<ExtractedChapter[]>([]);
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: savedBooks = [], isLoading: loadingBooks } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*, book_chapters(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleExtract = async (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      toast({ title: "Kuskure", description: "Da fatan za a zaɓi fayil ɗin PDF", variant: "destructive" });
      return;
    }

    setExtracting(true);
    setFileName(file.name);
    setBookTitle(file.name.replace('.pdf', ''));

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const { data, error } = await supabase.functions.invoke('extract-pdf', {
        body: formData,
      });

      if (error) throw error;

      setChapters(data.chapters || []);
      setRawText(data.rawText || "");
      toast({ title: "An gama!", description: `An fitar da babobi ${data.chapters?.length || 0} daga ${file.name}` });
    } catch (err) {
      console.error(err);
      toast({ title: "Kuskure", description: "Ba a iya fitar da rubutu daga PDF", variant: "destructive" });
    } finally {
      setExtracting(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (chapters.length === 0) return;

    setSaving(true);
    try {
      // Insert the book
      const { data: book, error: bookError } = await supabase
        .from("books")
        .insert({ title: bookTitle || fileName.replace('.pdf', ''), author: bookAuthor, file_name: fileName })
        .select()
        .single();

      if (bookError) throw bookError;

      // Insert chapters
      const chaptersToInsert = chapters.map((ch, i) => ({
        book_id: book.id,
        chapter_number: i + 1,
        title: ch.title,
        content: ch.content,
      }));

      const { error: chapError } = await supabase
        .from("book_chapters")
        .insert(chaptersToInsert);

      if (chapError) throw chapError;

      toast({ title: "An ajiye!", description: `An ajiye "${bookTitle}" tare da babobi ${chapters.length} a cikin database` });
      setChapters([]);
      setRawText("");
      setFileName("");
      setBookTitle("");
      setBookAuthor("");
      queryClient.invalidateQueries({ queryKey: ["books"] });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Kuskure", description: err.message || "Ba a iya ajiye littafi", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async (bookId: string, title: string) => {
    try {
      const { error } = await supabase.from("books").delete().eq("id", bookId);
      if (error) throw error;
      toast({ title: "An goge!", description: `An goge "${title}"` });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    } catch (err: any) {
      toast({ title: "Kuskure", description: err.message, variant: "destructive" });
    }
  };

  const generateBookCode = () => {
    if (chapters.length === 0) return "";

    const chaptersCode = chapters.map((ch, i) => {
      const contentLines = ch.content.map(line => `      "${line.replace(/"/g, '\\"')}",`).join('\n');
      return `  {
    id: ${i + 1},
    title: "${ch.title.replace(/"/g, '\\"')}",
    arabicTitle: "",
    content: [
${contentLines}
    ],
  }`;
    }).join(',\n');

    return `export interface Chapter {
  id: number;
  title: string;
  arabicTitle: string;
  content: string[];
}

export const bookTitle = "${(bookTitle || fileName.replace('.pdf', '')).replace(/"/g, '\\"')}";
export const bookAuthor = "${bookAuthor.replace(/"/g, '\\"')}";

export const chapters: Chapter[] = [
${chaptersCode}
];`;
  };

  const handleCopyCode = () => {
    const code = generateBookCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ title: "An kwafa!", description: "An kwafa lambar zuwa clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Fitar Da Rubutu Daga PDF
          </CardTitle>
          <CardDescription>
            Zaɓi fayil ɗin PDF don fitar da rubutu da ajiye a cikin database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Zaɓi PDF</Label>
            <div className="flex gap-2 mt-1">
              <Input
                ref={fileRef}
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleExtract(file);
                }}
                className="flex-1"
              />
              <Button
                variant="outline"
                disabled={extracting}
                onClick={() => fileRef.current?.click()}
              >
                {extracting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {extracting && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Ana fitar da rubutu daga {fileName}...
            </div>
          )}
        </CardContent>
      </Card>

      {chapters.length > 0 && (
        <>
          {/* Book metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bayanan Littafi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Sunan Littafi</Label>
                <Input value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="Sunan littafi" />
              </div>
              <div>
                <Label>Marubuci</Label>
                <Input value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} placeholder="Sunan marubuci" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Babobin Da Aka Fitar ({chapters.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {chapters.map((ch, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <h4 className="font-semibold text-sm">{ch.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {ch.content[0] || "(Babu rubutu)"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      Saƙonni: {ch.content.length}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save to DB */}
          <Button onClick={handleSaveToDatabase} disabled={saving} className="w-full gap-2 gradient-islamic text-primary-foreground">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            {saving ? "Ana ajiye..." : "Ajiye Littafi a Database"}
          </Button>

          {/* Copy code option */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lambar Littafi</CardTitle>
              <CardDescription>
                Ko kuma kwafa lambar zuwa bookContent.ts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted rounded-lg p-3 text-xs max-h-48 overflow-auto font-mono">
                {generateBookCode().slice(0, 500)}...
              </pre>
              <Button onClick={handleCopyCode} className="mt-3 w-full gap-2" variant="outline">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "An Kwafa!" : "Kwafa Lambar"}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {rawText && !chapters.length && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rubutu</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted rounded-lg p-3 text-xs max-h-48 overflow-auto whitespace-pre-wrap">
              {rawText.slice(0, 1000)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Saved Books */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Littattafan Da Aka Ajiye ({savedBooks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingBooks ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Ana lodi...
            </div>
          ) : savedBooks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Babu littafi da aka ajiye tukuna</p>
          ) : (
            <div className="space-y-2">
              {savedBooks.map((book: any) => (
                <div key={book.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <h4 className="font-semibold text-sm">{book.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {book.author && `${book.author} · `}
                      Babobi: {book.book_chapters?.[0]?.count || 0}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteBook(book.id, book.title)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
