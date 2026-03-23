import { useState, useEffect, useCallback } from "react";
import { BookReader } from "@/components/BookReader";
import { DailyVerse } from "@/components/DailyVerse";
import { ReadingStats } from "@/components/ReadingStats";
import { TableOfContents } from "@/components/TableOfContents";
import { SearchPanel } from "@/components/SearchPanel";
import { getUserData, saveUserData } from "@/lib/store";
import { bookTitle } from "@/lib/bookContent";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Sun,
  Moon,
  Settings,
  BookOpen,
  BarChart3,
  List,
  Type,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [showVerse, setShowVerse] = useState(false);
  const [activeTab, setActiveTab] = useState<"read" | "stats" | "toc" | "search">("read");
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const userData = getUserData();
    setIsDark(userData.darkMode);
    setCurrentPage(userData.currentPage || 0);
    setFontSize(userData.fontSize || 16);

    const today = new Date().toDateString();
    const lastVerse = localStorage.getItem("deen-lastVerse");
    if (lastVerse !== today) {
      setShowVerse(true);
      localStorage.setItem("deen-lastVerse", today);
    }

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleDark = () => {
    setIsDark(!isDark);
    saveUserData({ darkMode: !isDark });
  };

  const changeFontSize = (delta: number) => {
    const newSize = Math.max(12, Math.min(24, fontSize + delta));
    setFontSize(newSize);
    saveUserData({ fontSize: newSize });
  };

  const handleSelectChapter = useCallback((index: number) => {
    setCurrentPage(index);
    saveUserData({ currentPage: index });
    setActiveTab("read");
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="gradient-islamic px-3 py-3 flex items-center justify-between shrink-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="p-4 gradient-islamic">
              <SheetTitle className="text-primary-foreground font-display text-left">
                {bookTitle}
              </SheetTitle>
            </SheetHeader>
            <div className="py-2">
              <button onClick={() => setActiveTab("read")} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">Karanta Littafi</span>
              </button>
              <button onClick={() => setActiveTab("search")} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors">
                <Search className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">Bincika</span>
              </button>
              <button onClick={() => setActiveTab("toc")} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors">
                <List className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">Ƙunshiyar Littafi</span>
              </button>
              <button onClick={() => setActiveTab("stats")} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground">Ƙididdiga</span>
              </button>
              <button onClick={() => setShowVerse(true)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors">
                <span className="text-lg">✨</span>
                <span className="text-sm text-foreground">Ayar Yau</span>
              </button>
              <div className="border-t border-border my-2" />
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-foreground flex items-center gap-2">
                  <Type className="h-4 w-4" /> Girman Rubutu
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => changeFontSize(-2)} className="h-7 w-7 p-0 text-xs">A-</Button>
                  <span className="text-xs text-muted-foreground w-6 text-center">{fontSize}</span>
                  <Button variant="outline" size="sm" onClick={() => changeFontSize(2)} className="h-7 w-7 p-0 text-xs">A+</Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="font-display text-sm font-bold text-primary-foreground truncate mx-2">
          {bookTitle}
        </h1>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setActiveTab("search")} className="text-primary-foreground hover:bg-primary-foreground/10">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleDark} className="text-primary-foreground hover:bg-primary-foreground/10">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {activeTab === "read" && <BookReader key={currentPage} />}
        {activeTab === "stats" && <ReadingStats />}
        {activeTab === "toc" && <TableOfContents onSelectChapter={handleSelectChapter} currentPage={currentPage} />}
        {activeTab === "search" && <SearchPanel onSelectChapter={handleSelectChapter} />}
      </main>

      {showVerse && <DailyVerse onClose={() => setShowVerse(false)} />}
    </div>
  );
};

export default Index;
