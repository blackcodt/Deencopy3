import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Smartphone, Download, Loader2, CheckCircle2, XCircle, Package, Settings2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

type BuildStatus = "idle" | "triggering" | "building" | "completed" | "failed";

export function ApkBuilder() {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [buildType, setBuildType] = useState<"debug" | "release">("release");
  const [status, setStatus] = useState<BuildStatus>("idle");
  const [runId, setRunId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const [buildLog, setBuildLog] = useState<string[]>([]);

  const addLog = (msg: string) => setBuildLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // Load saved repo settings
  useEffect(() => {
    const saved = localStorage.getItem("apk-builder-repo");
    if (saved) {
      const { owner: o, repo: r } = JSON.parse(saved);
      setOwner(o);
      setRepo(r);
      setShowSettings(false);
    }
  }, []);

  const saveRepoSettings = () => {
    if (!owner || !repo) {
      toast({ title: "Kuskure", description: "Da fatan shigar da owner da repo", variant: "destructive" });
      return;
    }
    localStorage.setItem("apk-builder-repo", JSON.stringify({ owner, repo }));
    setShowSettings(false);
    toast({ title: "An ajiye!", description: "An adana saitunan GitHub" });
  };

  const triggerBuild = async () => {
    if (!owner || !repo) {
      setShowSettings(true);
      toast({ title: "Kuskure", description: "Da fatan saita GitHub repository tukuna", variant: "destructive" });
      return;
    }

    setStatus("triggering");
    setProgress(5);
    setDownloadUrl(null);
    setBuildLog([]);
    addLog("Ana fara gini...");

    try {
      const { data, error } = await supabase.functions.invoke('build-apk?action=trigger', {
        body: { owner, repo, buildType },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setRunId(data.runId);
      setStatus("building");
      setProgress(15);
      addLog(`An fara gini! Run ID: ${data.runId}`);
    } catch (err: any) {
      setStatus("failed");
      addLog(`Kuskure: ${err.message}`);
      toast({ title: "Kuskure", description: err.message, variant: "destructive" });
    }
  };

  const pollStatus = useCallback(async () => {
    if (!runId || status !== "building") return;

    try {
      const { data, error } = await supabase.functions.invoke(
        `build-apk?action=status&owner=${owner}&repo=${repo}&runId=${runId}`
      );

      if (error) throw error;

      if (data.status === "completed") {
        if (data.conclusion === "success") {
          setProgress(90);
          addLog("Gini ya gama nasara! Ana neman fayilin APK...");
          // Fetch download link
          const { data: dlData } = await supabase.functions.invoke(
            `build-apk?action=download&owner=${owner}&repo=${repo}&runId=${runId}`
          );
          if (dlData?.downloadUrl) {
            setDownloadUrl(dlData.downloadUrl);
            setStatus("completed");
            setProgress(100);
            addLog(`APK yana shirye! Girma: ${(dlData.size / 1024 / 1024).toFixed(1)} MB`);
          } else {
            setStatus("completed");
            setProgress(100);
            addLog("An gama amma ba a samu hanyar sauke ba. Ka duba GitHub Actions.");
          }
        } else {
          setStatus("failed");
          addLog(`Gini ya faskara: ${data.conclusion}`);
        }
      } else {
        // Increment progress while building
        setProgress(prev => Math.min(prev + 3, 85));
        addLog(`Yanayi: ${data.status}...`);
      }
    } catch (err: any) {
      console.error("Poll error:", err);
    }
  }, [runId, status, owner, repo]);

  // Poll every 15 seconds while building
  useEffect(() => {
    if (status !== "building") return;
    const interval = setInterval(pollStatus, 15000);
    return () => clearInterval(interval);
  }, [status, pollStatus]);

  const statusInfo = {
    idle: { icon: Package, color: "text-muted-foreground", label: "Shirye don gini" },
    triggering: { icon: Loader2, color: "text-primary", label: "Ana fara..." },
    building: { icon: Loader2, color: "text-primary", label: "Ana gina APK..." },
    completed: { icon: CheckCircle2, color: "text-green-500", label: "An gama!" },
    failed: { icon: XCircle, color: "text-destructive", label: "An samu matsala" },
  };

  const currentStatus = statusInfo[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-4">
      {/* Repo Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Gina APK na Android
              </CardTitle>
              <CardDescription>Ƙirƙira APK kai tsaye daga nan</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {showSettings && (
          <CardContent className="space-y-3 border-t pt-4">
            <div>
              <Label>GitHub Owner (username/org)</Label>
              <Input
                placeholder="misali: smallboymns"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </div>
            <div>
              <Label>Repository Name</Label>
              <Input
                placeholder="misali: musulunci-app"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
              />
            </div>
            <Button onClick={saveRepoSettings} className="w-full" variant="outline">
              Ajiye Saitunan Repo
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Build Controls */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Build Type Selection */}
          <div className="flex gap-2">
            <Button
              variant={buildType === "debug" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setBuildType("debug")}
              disabled={status === "building" || status === "triggering"}
            >
              Debug
            </Button>
            <Button
              variant={buildType === "release" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setBuildType("release")}
              disabled={status === "building" || status === "triggering"}
            >
              Release (Play Store)
            </Button>
          </div>

          {/* Status Display */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <StatusIcon className={`h-5 w-5 ${currentStatus.color} ${status === "building" || status === "triggering" ? "animate-spin" : ""}`} />
            <div className="flex-1">
              <p className="text-sm font-medium">{currentStatus.label}</p>
              {owner && repo && !showSettings && (
                <p className="text-xs text-muted-foreground">{owner}/{repo}</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {(status === "triggering" || status === "building" || status === "completed") && (
            <Progress value={progress} className="h-2" />
          )}

          {/* Build Button */}
          {(status === "idle" || status === "failed" || status === "completed") && (
            <Button
              onClick={triggerBuild}
              className="w-full gap-2 gradient-islamic text-primary-foreground"
              disabled={!owner || !repo}
            >
              <Package className="h-4 w-4" />
              {status === "completed" ? "Sake Gina APK" : "Fara Gina APK"}
            </Button>
          )}

          {/* Download Button */}
          {status === "completed" && downloadUrl && (
            <Button
              onClick={() => window.open(downloadUrl, "_blank")}
              className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="h-4 w-4" />
              Sauke APK
            </Button>
          )}

          {/* Build Logs */}
          {buildLog.length > 0 && (
            <div className="bg-muted rounded-lg p-3 max-h-40 overflow-y-auto">
              {buildLog.map((log, i) => (
                <p key={i} className="text-xs font-mono text-muted-foreground">{log}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signing Info */}
      {buildType === "release" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Saini don Play Store</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>Don gina signed APK mai shiga Play Store, ƙara waɗannan secrets a GitHub repo → Settings → Secrets:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><code className="bg-muted px-1 rounded">KEYSTORE_BASE64</code> — Keystore file (base64 encoded)</li>
              <li><code className="bg-muted px-1 rounded">KEYSTORE_PASSWORD</code> — Kalmar sirri ta keystore</li>
              <li><code className="bg-muted px-1 rounded">KEY_ALIAS</code> — Sunan makulli</li>
              <li><code className="bg-muted px-1 rounded">KEY_PASSWORD</code> — Kalmar sirri ta makulli</li>
            </ul>
            <p className="mt-2">Don ƙirƙirar keystore, yi amfani da:</p>
            <pre className="bg-muted p-2 rounded text-[10px] overflow-x-auto">
              keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias myapp
            </pre>
            <p>Sannan encode shi: <code className="bg-muted px-1 rounded">base64 release.jks &gt; keystore.txt</code></p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
