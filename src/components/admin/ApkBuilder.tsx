import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, ExternalLink, Github, Package, ArrowRight } from "lucide-react";

export function ApkBuilder() {
  const repoUrl = "https://github.com"; // User will replace with their actual repo

  const steps = [
    {
      num: 1,
      title: "Tura zuwa GitHub",
      desc: "Danna \"Export to GitHub\" a cikin Lovable don tura lambar zuwa GitHub.",
      icon: Github,
    },
    {
      num: 2,
      title: "Fara Gina APK",
      desc: "Je zuwa GitHub → Actions → \"Build Android APK\" → Run workflow → Zaɓi debug ko release.",
      icon: Package,
    },
    {
      num: 3,
      title: "Sauke APK",
      desc: "Bayan gini ya gama, sauke APK daga cikin Artifacts a ƙasan ginin.",
      icon: Smartphone,
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Gina APK na Android
          </CardTitle>
          <CardDescription>
            Ƙirƙiri APK ta hanyar GitHub Actions — ba tare da kayan aiki na waje ba
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step) => (
            <div key={step.num} className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                {step.num}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <step.icon className="h-4 w-4" />
                  {step.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mataki Na Gaba</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full gap-2"
            variant="outline"
            onClick={() => window.open("https://docs.lovable.dev/tips-tricks/mobile-app", "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            Karanta Jagoran Capacitor
          </Button>
          <Button
            className="w-full gap-2"
            variant="outline"
            onClick={() => window.open(`${repoUrl}/actions`, "_blank")}
          >
            <Github className="h-4 w-4" />
            Bude GitHub Actions
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Bayan ka tura zuwa GitHub, je zuwa tab ɗin Actions don fara gina APK.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
