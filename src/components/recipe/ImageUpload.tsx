import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { compressImage } from "@/lib/image";
import { cn } from "@/lib/utils";

export function ImageUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      const url = await compressImage(file);
      onChange(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
          <img src={value} alt="Recipe" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-black"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="grid size-8 place-items-center rounded-full bg-white/90 text-black"
              aria-label="Remove image"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed text-muted-foreground transition-colors",
            dragging
              ? "border-primary/70 bg-primary/5 text-primary"
              : "border-border bg-card/30 hover:border-primary/40",
          )}
        >
          {busy ? (
            <Loader2 className="size-7 animate-spin" />
          ) : (
            <ImagePlus className="size-7" />
          )}
          <span className="text-sm">
            {busy ? "Processing…" : "Drop a photo or click to upload"}
          </span>
        </button>
      )}
    </div>
  );
}
