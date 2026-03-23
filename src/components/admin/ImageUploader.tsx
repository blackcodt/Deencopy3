import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface Props {
  label: string;
  currentUrl: string;
  onUpload: (file: File) => Promise<void>;
  accept?: string;
}

export function ImageUploader({ label, currentUrl, onUpload, accept = "image/*" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      {currentUrl ? (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border mb-2">
          <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center mb-2">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Ana loda..." : currentUrl ? "Canza Hoto" : "Zaɓi Hoto"}
      </Button>
    </div>
  );
}
