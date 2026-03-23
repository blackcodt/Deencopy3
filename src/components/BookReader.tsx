import { useState, useCallback, useEffect, useRef } from "react";
import { chapters } from "@/lib/bookContent";
import { getUserData, saveUserData } from "@/lib/store";
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdBanner } from "./AdBanner";
import { ShareButton } from "./ShareButton";

export function BookReader() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [userData, setUserData] = useState(getUserData);
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const totalPages = chapters.length;

  useEffect(() => {
    setCurrentPage(userData.currentPage || 0);
  }, []);

  useEffect(() => {
    const note = userData.notes[currentPage] || "";
    setNoteText(note);
  }, [currentPage, userData.notes]);

  const goToPage = useCallback(
    (direction: "next" | "prev") => {
      if (isFlipping) return;
      const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
      if (newPage < 0 || newPage >= totalPages) return;

      setIsFlipping(true);
      setFlipDirection(direction);

      setTimeout(() => {
        setCurrentPage(newPage);
        setIsFlipping(false);
        setFlipDirection(null);
        const newData = {
          currentPage: newPage,
          totalPagesRead: Math.max(userData.totalPagesRead, newPage + 1),
        };
        saveUserData(newData);
        setUserData((prev) => ({ ...prev, ...newData }));
      }, 800);
    },
    [currentPage, isFlipping, totalPages, userData.totalPagesRead]
  );

  // Swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goToPage("next");
      else goToPage("prev");
    }
  };

  const toggleBookmark = () => {
    const bookmarks = userData.bookmarks.includes(currentPage)
      ? userData.bookmarks.filter((b) => b !== currentPage)
      : [...userData.bookmarks, currentPage];
    saveUserData({ bookmarks });
    setUserData((prev) => ({ ...prev, bookmarks }));
  };

  const saveNote = () => {
    const notes = { ...userData.notes, [currentPage]: noteText };
    saveUserData({ notes });
    setUserData((prev) => ({ ...prev, notes }));
    setShowNote(false);
  };

  const chapter = chapters[currentPage];
  const isBookmarked = userData.bookmarks.includes(currentPage);

  const flipClass = isFlipping
    ? flipDirection === "next"
      ? "book-flip-next"
      : "book-flip-prev"
    : "";

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background">
      <AdBanner position="top" />

      <div
        className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl px-3 py-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 3D Book Container */}
        <div className="relative w-full" style={{ perspective: "1400px" }}>
          <div
            className={`relative bg-card rounded-lg book-shadow overflow-hidden transform-gpu ${flipClass}`}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Spine */}
            <div className="absolute left-0 top-0 bottom-0 w-3 gradient-islamic opacity-90 rounded-l-lg z-10" />
            <div className="absolute left-3 top-0 bottom-0 w-px bg-foreground/10" />

            {/* Page curl shadow during flip */}
            {isFlipping && (
              <div className="absolute inset-0 pointer-events-none z-20">
                <div
                  className={`absolute top-0 bottom-0 w-16 ${
                    flipDirection === "next"
                      ? "right-0 bg-gradient-to-l"
                      : "left-4 bg-gradient-to-r"
                  } from-foreground/15 to-transparent`}
                />
              </div>
            )}

            {/* Content */}
            <div className="pl-7 pr-4 py-6 min-h-[60vh] flex flex-col">
              <div className="text-center mb-6 border-b border-border pb-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Babi {chapter.id}
                </p>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">
                  {chapter.title}
                </h2>
                <p className="font-arabic text-xl text-gold">{chapter.arabicTitle}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="h-px w-12 bg-gold/40" />
                  <div className="w-2 h-2 rotate-45 bg-gold/60" />
                  <div className="h-px w-12 bg-gold/40" />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {chapter.content.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-foreground/90 leading-relaxed font-body"
                    style={{ fontSize: `${userData.fontSize}px` }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="text-center mt-6 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Shafi {currentPage + 1} na {totalPages}
                </span>
              </div>
            </div>

            {/* Page edges */}
            <div className="absolute right-0 top-2 bottom-2 w-1 bg-gradient-to-r from-transparent to-foreground/5 rounded-r" />
            <div className="absolute right-1 top-4 bottom-4 w-px bg-foreground/5" />
            <div className="absolute right-2 top-6 bottom-6 w-px bg-foreground/3" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between w-full mt-4 gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage("prev")}
            disabled={currentPage === 0 || isFlipping}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleBookmark}
              className={isBookmarked ? "text-gold" : "text-muted-foreground"}
            >
              {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNote(!showNote)}
              className={userData.notes[currentPage] ? "text-gold" : "text-muted-foreground"}
            >
              <StickyNote className="h-5 w-5" />
            </Button>
            <ShareButton
              text={`📖 ${chapter.title}\n\n${chapter.content[0]?.substring(0, 150)}...`}
              title={`Babi ${chapter.id}: ${chapter.title}`}
              className="text-muted-foreground"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage("next")}
            disabled={currentPage === totalPages - 1 || isFlipping}
            className="rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Notes panel */}
        {showNote && (
          <div className="w-full mt-3 bg-card rounded-lg p-3 border border-border animate-fade-in">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Rubuta bayanan ka a nan..."
              className="w-full bg-transparent border border-input rounded-md p-2 text-sm resize-none h-20 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button size="sm" onClick={saveNote} className="mt-2 gradient-islamic text-primary-foreground">
              Ajiye Bayanin
            </Button>
          </div>
        )}
      </div>

      <AdBanner position="bottom" />
    </div>
  );
}
