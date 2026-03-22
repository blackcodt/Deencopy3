import { useEffect, useRef } from "react";
import { getAdminSettings } from "@/lib/store";

interface AdBannerProps {
  position?: "top" | "bottom" | "inline";
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdBanner({ position = "bottom" }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const settings = getAdminSettings();

  useEffect(() => {
    if (settings.adProvider === "adsense" && settings.adsensePublisherId && settings.adsenseSlotId) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // AdSense not loaded
      }
    }
  }, [settings]);

  const positionClasses = {
    top: "w-full py-1",
    bottom: "w-full py-1 mt-auto",
    inline: "w-full py-2 my-4",
  };

  // If no ad IDs configured, show placeholder
  if (!settings.adsensePublisherId && !settings.admobBannerId) {
    return (
      <div className={`${positionClasses[position]} flex items-center justify-center`}>
        <div className="bg-muted rounded-md px-4 py-2 text-xs text-muted-foreground text-center w-full max-w-md">
          <p className="font-medium">📢 Ad Space</p>
          <p>Configure ads in Admin Panel</p>
        </div>
      </div>
    );
  }

  if (settings.adProvider === "adsense" && settings.adsensePublisherId) {
    return (
      <div ref={adRef} className={positionClasses[position]}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={settings.adsensePublisherId}
          data-ad-slot={settings.adsenseSlotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // AdMob placeholder (actual AdMob requires native wrapper)
  return (
    <div className={`${positionClasses[position]} flex items-center justify-center`}>
      <div className="bg-muted rounded-md px-4 py-2 text-xs text-muted-foreground text-center">
        <p>AdMob: {settings.admobBannerId}</p>
      </div>
    </div>
  );
}
