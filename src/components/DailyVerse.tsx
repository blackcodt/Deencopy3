import { useState, useEffect } from "react";
import { dailyVerses } from "@/lib/bookContent";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "./ShareButton";

export function DailyVerse({ onClose }: { onClose: () => void }) {
  const [verse, setVerse] = useState(dailyVerses[0]);

  useEffect(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    setVerse(dailyVerses[dayOfYear % dailyVerses.length]);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-xl p-6 max-w-sm w-full relative golden-border animate-fade-in">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2">
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-8 bg-gold/40" />
            <span className="text-xs uppercase tracking-widest text-gold font-medium">Daily Verse</span>
            <div className="h-px w-8 bg-gold/40" />
          </div>

          <p className="font-display text-2xl text-gold leading-relaxed mb-4 direction-rtl">
            {verse.arabic}
          </p>

          <p className="text-foreground/90 italic leading-relaxed mb-2">
            "{verse.translation}"
          </p>

          <p className="text-xs text-muted-foreground mb-4">— {verse.reference}</p>

          <ShareButton
            text={`"${verse.translation}"\n— ${verse.reference}`}
            title="Ayar Yau - Musulunci"
            variant="outline"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
