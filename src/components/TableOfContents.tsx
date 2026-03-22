import { chapters } from "@/lib/bookContent";
import { getUserData } from "@/lib/store";
import { BookmarkCheck } from "lucide-react";

interface Props {
  onSelectChapter: (index: number) => void;
  currentPage: number;
}

export function TableOfContents({ onSelectChapter, currentPage }: Props) {
  const userData = getUserData();

  return (
    <div className="py-2">
      <h3 className="font-display text-lg font-bold text-foreground px-4 mb-3">Table of Contents</h3>
      <div className="space-y-1">
        {chapters.map((chapter, index) => {
          const isBookmarked = userData.bookmarks.includes(index);
          const isCurrent = currentPage === index;
          return (
            <button
              key={chapter.id}
              onClick={() => onSelectChapter(index)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors
                ${isCurrent ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-muted"}
              `}
            >
              <span className="text-xs font-mono text-muted-foreground w-6">{chapter.id}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isCurrent ? "text-primary" : "text-foreground"}`}>
                  {chapter.title}
                </p>
                <p className="text-xs text-muted-foreground font-display">{chapter.arabicTitle}</p>
              </div>
              {isBookmarked && <BookmarkCheck className="h-4 w-4 text-gold shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
