import { useState, useCallback, useEffect } from "react";
import { chapters } from "@/lib/bookContent";
import { getUserData, saveUserData } from "@/lib/store";
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdBanner } from "./AdBanner";

export function BookReader() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [userData, setUserData] = useState(getUserData);
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState("");

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
      }, 600);
    },
    [currentPage, isFlipping, totalPages, userData.totalPagesRead]
  );

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

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background">
      {/* Top Ad */}
      <AdBanner position="top" />

      {/* Book Container */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl px-3 py-4">
        {/* Book */}
        <div className="relative w-full perspective-[1200px]">
          <div
            className={`
              relative bg-card rounded-lg book-shadow overflow-hidden
              transition-transform duration-500
              ${isFlipping && flipDirection === "next" ? "animate-fade-in" : ""}
              ${isFlipping && flipDirection === "prev" ? "animate-fade-in" : ""}
            `}
          >
            {/* Book spine decoration */}
            <div className="absolute left-0 top-0 bottom-0 w-2 gradient-islamic opacity-80 rounded-l-lg" />

            {/* Page content */}
            <div className="pl-6 pr-4 py-6 min-h-[60vh] flex flex-col">
              {/* Chapter header */}
              <div className="text-center mb-6 border-b border-border pb-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Chapter {chapter.id}
                </p>
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                  {chapter.title}
                </h2>
                <p className="font-display text-xl text-gold">{chapter.arabicTitle}</p>
                {/* Decorative separator */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="h-px w-12 bg-gold/40" />
                  <div className="w-2 h-2 rotate-45 bg-gold/60" />
                  <div className="h-px w-12 bg-gold/40" />
                </div>
              </div>

              {/* Chapter body */}
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

              {/* Page number */}
              <div className="text-center mt-6 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Page {currentPage + 1} of {totalPages}
                </span>
              </div>
            </div>

            {/* Page edge effect */}
            <div className="absolute right-0 top-2 bottom-2 w-1 bg-gradient-to-r from-transparent to-foreground/5 rounded-r" />
            <div className="absolute right-1 top-3 bottom-3 w-px bg-foreground/5" />
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
              placeholder="Add your notes for this chapter..."
              className="w-full bg-transparent border border-input rounded-md p-2 text-sm resize-none h-20 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button size="sm" onClick={saveNote} className="mt-2 gradient-islamic text-primary-foreground">
              Save Note
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Ad */}
      <AdBanner position="bottom" />
    </div>
  );
}
