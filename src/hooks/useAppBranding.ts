import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppBranding {
  logoUrl: string;
  loadingImageUrl: string;
  template: "classic" | "modern" | "royal" | "minimal" | "dark";
  primaryColor: string;
  accentColor: string;
  appName: string;
  adProvider: "adsense" | "admob";
  adsensePublisherId: string;
  adsenseSlotId: string;
  admobBannerId: string;
  admobInterstitialId: string;
}

const DEFAULT_BRANDING: AppBranding = {
  logoUrl: "",
  loadingImageUrl: "",
  template: "classic",
  primaryColor: "#2d6a4f",
  accentColor: "#c9a84c",
  appName: "Musulunci - Addinin Allah Ne",
  adProvider: "adsense",
  adsensePublisherId: "",
  adsenseSlotId: "",
  admobBannerId: "",
  admobInterstitialId: "",
};

export function useAppBranding() {
  const [branding, setBranding] = useState<AppBranding>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      const { data } = await supabase
        .from("app_settings")
        .select("setting_key, setting_value")
        .eq("setting_key", "branding")
        .maybeSingle();

      if (data?.setting_value) {
        setBranding({ ...DEFAULT_BRANDING, ...(data.setting_value as unknown as Partial<AppBranding>) });
      }
    } catch {
      // Fall back to defaults
    } finally {
      setLoading(false);
    }
  };

  const saveBranding = async (newBranding: Partial<AppBranding>) => {
    const merged = { ...branding, ...newBranding };
    setBranding(merged);

    const { error } = await supabase
      .from("app_settings")
      .upsert(
        [{ setting_key: "branding", setting_value: merged as unknown as Record<string, unknown> }],
        { onConflict: "setting_key" }
      );

    return !error;
  };

  const uploadAsset = async (file: File, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from("app-assets")
      .upload(path, file, { upsert: true });

    if (error) return null;

    const { data: urlData } = supabase.storage
      .from("app-assets")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  return { branding, loading, saveBranding, uploadAsset, refreshBranding: loadBranding };
}
