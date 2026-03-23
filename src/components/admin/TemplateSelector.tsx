import type { AppBranding } from "@/hooks/useAppBranding";

const templates = [
  {
    id: "classic" as const,
    name: "Gargajiya",
    desc: "Emerald & Gold Islamic classic",
    colors: { bg: "bg-emerald-900", accent: "bg-yellow-600" },
  },
  {
    id: "modern" as const,
    name: "Zamani",
    desc: "Clean blue with light accents",
    colors: { bg: "bg-blue-700", accent: "bg-sky-400" },
  },
  {
    id: "royal" as const,
    name: "Sarauta",
    desc: "Deep purple with gold trim",
    colors: { bg: "bg-purple-900", accent: "bg-amber-500" },
  },
  {
    id: "minimal" as const,
    name: "Sauƙi",
    desc: "Minimal white with subtle tones",
    colors: { bg: "bg-stone-700", accent: "bg-stone-400" },
  },
  {
    id: "dark" as const,
    name: "Dare",
    desc: "Dark theme with teal accents",
    colors: { bg: "bg-slate-900", accent: "bg-teal-500" },
  },
];

interface Props {
  selected: AppBranding["template"];
  onSelect: (template: AppBranding["template"]) => void;
}

export function TemplateSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`p-3 rounded-lg border text-left transition-all ${
            selected === t.id
              ? "golden-border bg-primary/5"
              : "border-border hover:border-primary/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-5 h-5 rounded-full ${t.colors.bg}`} />
            <div className={`w-3 h-3 rounded-full ${t.colors.accent}`} />
          </div>
          <p className="text-sm font-medium text-foreground">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.desc}</p>
        </button>
      ))}
    </div>
  );
}
