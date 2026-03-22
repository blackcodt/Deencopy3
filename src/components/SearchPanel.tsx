import { useState, useMemo } from "react";
import { chapters } from "@/lib/bookContent";
import { Search, X, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  chapterIndex: number;
  chapterId: number;
  chapterTitle: string;
  snippet: string;
  matchCount: number;
}

interface SearchPanelProps {
  onSelectChapter: (index: number) => void;
}

export function SearchPanel({ onSelectChapter }: SearchPanelProps) {
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return chapters
      .map((ch, idx) => {
        const fullText = ch.content.join(" ");
        const lower = fullText.toLowerCase();
        let matchCount = 0;
        let pos = 0;
        while ((pos = lower.indexOf(q, pos)) !== -1) {
          matchCount++;
          pos += q.length;
        }
        if (matchCount === 0 && !ch.title.toLowerCase().includes(q)) return null;

        // Build snippet around first match
        const firstIdx = lower.indexOf(q);
        let snippet = "";
        if (firstIdx >= 0) {
          const start = Math.max(0, firstIdx - 40);
          const end = Math.min(fullText.length, firstIdx + q.length + 60);
          snippet =
            (start > 0 ? "..." : "") +
            fullText.slice(start, end) +
            (end < fullText.length ? "..." : "");
        } else {
          snippet = fullText.slice(0, 100) + "...";
        }

        return {
          chapterIndex: idx,
          chapterId: ch.id,
          chapterTitle: ch.title,
          snippet,
          matchCount: matchCount || 1,
        };
      })
      .filter(Boolean) as SearchResult[];
  }, [query]);

  const highlightText = (text: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-accent/40 text-accent-foreground rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Bincika cikin littafi..."
            className="pl-9 pr-9"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setQuery("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        {query.trim().length >= 2 && (
          <p className="text-xs text-muted-foreground mt-2">
            {results.length} {results.length === 1 ? "sakamako" : "sakamakon"} an samu
          </p>
        )}
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
        {results.length === 0 && query.trim().length >= 2 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Ba a samu sakamako ba</p>
          </div>
        )}
        {results.map((r) => (
          <button
            key={r.chapterIndex}
            onClick={() => onSelectChapter(r.chapterIndex)}
            className="w-full text-left p-3 mb-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-sm font-semibold text-foreground truncate">
                Babi {r.chapterId}: {r.chapterTitle}
              </span>
              <span className="text-xs text-muted-foreground ml-auto shrink-0">
                {r.matchCount}×
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {highlightText(r.snippet)}
            </p>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
}
