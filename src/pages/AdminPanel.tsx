import { useState } from "react";
import { useAppBranding } from "@/hooks/useAppBranding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Shield, Palette, Image, Megaphone, FileText, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TemplateSelector } from "@/components/admin/TemplateSelector";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PdfExtractor } from "@/components/admin/PdfExtractor";
import { ApkBuilder } from "@/components/admin/ApkBuilder";
import { supabase } from "@/integrations/supabase/client";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const { branding, saveBranding, uploadAsset, loading } = useAppBranding();
  const [localBranding, setLocalBranding] = useState(branding);
  const [activeSection, setActiveSection] = useState<"design" | "ads" | "branding" | "pdf" | "apk">("design");

  // Sync local branding when cloud branding loads
  useState(() => {
    if (!loading) setLocalBranding(branding);
  });

  const handleLogin = async () => {
    setLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Kuskure", description: error.message, variant: "destructive" });
      } else {
        setIsAuthenticated(true);
        setLocalBranding(branding);
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSave = async () => {
    const success = await saveBranding(localBranding);
    if (success) {
      toast({ title: "An ajiye!", description: "An canza saitunan nasara." });
    } else {
      toast({ title: "Kuskure", description: "Ba a iya ajiye saituna.", variant: "destructive" });
    }
  };

  const handleLogoUpload = async (file: File) => {
    const url = await uploadAsset(file, `logo-${Date.now()}.${file.name.split('.').pop()}`);
    if (url) setLocalBranding(prev => ({ ...prev, logoUrl: url }));
  };

  const handleLoadingImageUpload = async (file: File) => {
    const url = await uploadAsset(file, `loading-${Date.now()}.${file.name.split('.').pop()}`);
    if (url) setLocalBranding(prev => ({ ...prev, loadingImageUrl: url }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Shield className="h-10 w-10 text-primary mx-auto mb-2" />
            <CardTitle className="font-display">Admin Access</CardTitle>
            <CardDescription>Sign in with your admin account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} disabled={loggingIn} className="w-full gradient-islamic text-primary-foreground">
              {loggingIn ? "Ana shiga..." : "Shiga"}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> Komawa Littafi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sectionTabs = [
    { id: "design" as const, label: "Tsari", icon: Palette },
    { id: "branding" as const, label: "Alamar", icon: Image },
    { id: "ads" as const, label: "Tallace", icon: Megaphone },
    { id: "pdf" as const, label: "PDF", icon: FileText },
    { id: "apk" as const, label: "APK", icon: Smartphone },
  ];

  return (
    <div className="min-h-screen bg-background p-4 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Panel</h1>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 mb-4 bg-muted/50 p-1 rounded-lg">
        {sectionTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeSection === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeSection === "design" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zaɓi Tsarin App</CardTitle>
                <CardDescription>Zaɓi ɗaya daga cikin templates</CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateSelector
                  selected={localBranding.template}
                  onSelect={(template) => setLocalBranding(prev => ({ ...prev, template }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Launuka</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Babban Launi (Primary)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={localBranding.primaryColor}
                      onChange={(e) => setLocalBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={localBranding.primaryColor}
                      onChange={(e) => setLocalBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Launin Ado (Accent)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={localBranding.accentColor}
                      onChange={(e) => setLocalBranding(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={localBranding.accentColor}
                      onChange={(e) => setLocalBranding(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeSection === "branding" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sunan App</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={localBranding.appName}
                  onChange={(e) => setLocalBranding(prev => ({ ...prev, appName: e.target.value }))}
                  placeholder="Sunan littafin"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hotunan App</CardTitle>
                <CardDescription>Loda logo da hoton lodi</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-6">
                <ImageUploader
                  label="App Logo"
                  currentUrl={localBranding.logoUrl}
                  onUpload={handleLogoUpload}
                />
                <ImageUploader
                  label="Hoton Lodi"
                  currentUrl={localBranding.loadingImageUrl}
                  onUpload={handleLoadingImageUpload}
                />
              </CardContent>
            </Card>
          </>
        )}

        {activeSection === "ads" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mai Talla</CardTitle>
                <CardDescription>Zaɓi AdMob ko AdSense</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="adProvider"
                      checked={localBranding.adProvider === "adsense"}
                      onChange={() => setLocalBranding(prev => ({ ...prev, adProvider: "adsense" }))}
                      className="accent-primary"
                    />
                    AdSense
                  </Label>
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="adProvider"
                      checked={localBranding.adProvider === "admob"}
                      onChange={() => setLocalBranding(prev => ({ ...prev, adProvider: "admob" }))}
                      className="accent-primary"
                    />
                    AdMob
                  </Label>
                </div>
              </CardContent>
            </Card>

            {localBranding.adProvider === "adsense" && (
              <Card>
                <CardHeader><CardTitle className="text-lg">AdSense</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Publisher ID (ca-pub-xxx)</Label>
                    <Input
                      placeholder="ca-pub-1234567890"
                      value={localBranding.adsensePublisherId}
                      onChange={(e) => setLocalBranding(prev => ({ ...prev, adsensePublisherId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Ad Slot ID</Label>
                    <Input
                      placeholder="1234567890"
                      value={localBranding.adsenseSlotId}
                      onChange={(e) => setLocalBranding(prev => ({ ...prev, adsenseSlotId: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {localBranding.adProvider === "admob" && (
              <Card>
                <CardHeader><CardTitle className="text-lg">AdMob</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Banner Ad Unit ID</Label>
                    <Input
                      placeholder="ca-app-pub-xxx/yyy"
                      value={localBranding.admobBannerId}
                      onChange={(e) => setLocalBranding(prev => ({ ...prev, admobBannerId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Interstitial Ad Unit ID</Label>
                    <Input
                      placeholder="ca-app-pub-xxx/yyy"
                      value={localBranding.admobInterstitialId}
                      onChange={(e) => setLocalBranding(prev => ({ ...prev, admobInterstitialId: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeSection === "pdf" && <PdfExtractor />}

        {activeSection === "apk" && <ApkBuilder />}

        <Button onClick={handleSave} className="w-full gradient-islamic text-primary-foreground gap-2">
          <Save className="h-4 w-4" />
          Ajiye Duk Saituna
        </Button>
      </div>
    </div>
  );
}
