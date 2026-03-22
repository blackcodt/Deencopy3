import { useState, useEffect } from "react";
import { getAdminSettings, saveAdminSettings, type AdminSettings } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [settings, setSettings] = useState<AdminSettings>(getAdminSettings());

  const handleLogin = () => {
    const adminSettings = getAdminSettings();
    if (password === adminSettings.adminPassword) {
      setIsAuthenticated(true);
    } else {
      toast({ title: "Invalid password", variant: "destructive" });
    }
  };

  const handleSave = () => {
    saveAdminSettings(settings);
    toast({ title: "Settings saved!", description: "Changes applied successfully." });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Shield className="h-10 w-10 text-primary mx-auto mb-2" />
            <CardTitle className="font-display">Admin Access</CardTitle>
            <CardDescription>Enter admin password to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full gradient-islamic text-primary-foreground">
              Login
            </Button>
            <Button variant="ghost" onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Reader
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Panel</h1>
      </div>

      <div className="space-y-4">
        {/* Ad Provider */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ad Provider</CardTitle>
            <CardDescription>Choose between AdMob and AdSense</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="adProvider"
                  checked={settings.adProvider === "adsense"}
                  onChange={() => setSettings({ ...settings, adProvider: "adsense" })}
                  className="accent-primary"
                />
                AdSense
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="adProvider"
                  checked={settings.adProvider === "admob"}
                  onChange={() => setSettings({ ...settings, adProvider: "admob" })}
                  className="accent-primary"
                />
                AdMob
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* AdSense Settings */}
        {settings.adProvider === "adsense" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AdSense Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="adsensePub">Publisher ID (ca-pub-xxx)</Label>
                <Input
                  id="adsensePub"
                  placeholder="ca-pub-1234567890"
                  value={settings.adsensePublisherId}
                  onChange={(e) => setSettings({ ...settings, adsensePublisherId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="adsenseSlot">Ad Slot ID</Label>
                <Input
                  id="adsenseSlot"
                  placeholder="1234567890"
                  value={settings.adsenseSlotId}
                  onChange={(e) => setSettings({ ...settings, adsenseSlotId: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* AdMob Settings */}
        {settings.adProvider === "admob" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AdMob Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="admobBanner">Banner Ad Unit ID</Label>
                <Input
                  id="admobBanner"
                  placeholder="ca-app-pub-xxx/yyy"
                  value={settings.admobBannerId}
                  onChange={(e) => setSettings({ ...settings, admobBannerId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="admobInterstitial">Interstitial Ad Unit ID</Label>
                <Input
                  id="admobInterstitial"
                  placeholder="ca-app-pub-xxx/yyy"
                  value={settings.admobInterstitialId}
                  onChange={(e) => setSettings({ ...settings, admobInterstitialId: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">App Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {(["emerald", "midnight", "desert"] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSettings({ ...settings, theme })}
                  className={`p-3 rounded-lg border text-center capitalize text-sm transition-all
                    ${settings.theme === theme ? "golden-border bg-primary/5" : "border-border hover:border-primary/30"}
                  `}
                >
                  <div
                    className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                      theme === "emerald" ? "bg-primary" : theme === "midnight" ? "bg-foreground" : "bg-accent"
                    }`}
                  />
                  {theme}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin Password</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              placeholder="New admin password"
              value={settings.adminPassword}
              onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
            />
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full gradient-islamic text-primary-foreground gap-2">
          <Save className="h-4 w-4" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
