import { getUserData } from "@/lib/store";
import { chapters } from "@/lib/bookContent";
import { Flame, BookOpen, Bookmark, Target } from "lucide-react";

export function ReadingStats() {
  const userData = getUserData();
  const progress = Math.round((userData.totalPagesRead / chapters.length) * 100);

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      <div className="bg-card rounded-lg p-3 border border-border text-center">
        <Flame className="h-6 w-6 text-gold mx-auto mb-1" />
        <p className="text-2xl font-bold text-foreground">{userData.readingStreak}</p>
        <p className="text-xs text-muted-foreground">Day Streak</p>
      </div>
      <div className="bg-card rounded-lg p-3 border border-border text-center">
        <BookOpen className="h-6 w-6 text-primary mx-auto mb-1" />
        <p className="text-2xl font-bold text-foreground">{userData.totalPagesRead}</p>
        <p className="text-xs text-muted-foreground">Pages Read</p>
      </div>
      <div className="bg-card rounded-lg p-3 border border-border text-center">
        <Bookmark className="h-6 w-6 text-gold mx-auto mb-1" />
        <p className="text-2xl font-bold text-foreground">{userData.bookmarks.length}</p>
        <p className="text-xs text-muted-foreground">Bookmarks</p>
      </div>
      <div className="bg-card rounded-lg p-3 border border-border text-center">
        <Target className="h-6 w-6 text-primary mx-auto mb-1" />
        <p className="text-2xl font-bold text-foreground">{progress}%</p>
        <p className="text-xs text-muted-foreground">Complete</p>
      </div>
    </div>
  );
}
