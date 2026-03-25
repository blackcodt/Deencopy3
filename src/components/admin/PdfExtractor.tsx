import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ExtractedChapter {
  title: string;
  content: string[];
}

export function PdfExtractor() {
  const [extracting, setExtracting] = useState(false);
  const [chapters, setChapters] = useState<ExtractedChapter[]>([]);
  const [rawText, setRawText] = useState("");
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExtract = async (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      toast({ title: "Kuskure", description: "Da fatan za a zaɓi fayil ɗin PDF", variant: "destructive" });
      return;
    }

    setExtracting(true);
    setFileName(file.name);

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

export const bookTitle = "${fileName.replace('.pdf', '').replace(/"/g, '\\"')}";
export const bookAuthor = "";

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
            Zaɓi fayil ɗin PDF don fitar da rubutu da babobi
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lambar Littafi</CardTitle>
              <CardDescription>
                Kwafa wannan lambar zuwa bookContent.ts don ƙirƙirar sabon littafi
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
    </div>
  );
}
