import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface ShareButtonProps {
  text: string;
  title?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "icon" | "sm" | "default";
  className?: string;
}

export function ShareButton({ text, title = "Musulunci - Addinin Allah Ne", variant = "ghost", size = "icon", className }: ShareButtonProps) {
  const shareUrl = window.location.href;
  const encodedText = encodeURIComponent(text);
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareOptions = [
    {
      label: "WhatsApp",
      icon: "💬",
      action: () => window.open(`https://wa.me/?text=${encodedText}%0A%0A${encodedUrl}`, "_blank"),
    },
    {
      label: "Facebook",
      icon: "📘",
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, "_blank"),
    },
    {
      label: "Twitter / X",
      icon: "🐦",
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, "_blank"),
    },
    {
      label: "Telegram",
      icon: "✈️",
      action: () => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, "_blank"),
    },
    {
      label: "Kwafi Rubutu",
      icon: "📋",
      action: async () => {
        await navigator.clipboard.writeText(`${text}\n\n${shareUrl}`);
        toast({ title: "An kwafi!", description: "An kwafi rubutun zuwa clipboard." });
      },
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch {}
    }
  };

  if (navigator.share) {
    return (
      <Button variant={variant} size={size} onClick={handleNativeShare} className={className}>
        <Share2 className="h-4 w-4" />
        {size !== "icon" && <span className="ml-1">Raba</span>}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4" />
          {size !== "icon" && <span className="ml-1">Raba</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {shareOptions.map((opt) => (
          <DropdownMenuItem key={opt.label} onClick={opt.action} className="cursor-pointer gap-2">
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
