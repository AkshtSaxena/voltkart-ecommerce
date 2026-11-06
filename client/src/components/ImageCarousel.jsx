import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "./ProductUI.jsx";


const VIEWS = [
  { label: "Full view", mode: "fit", cls: "" },
  { label: "Close-up 1", mode: "fill", cls: "scale-[1.8] origin-top-left" },
  { label: "Close-up 2", mode: "fill", cls: "scale-[1.8] origin-bottom-right" },
];

export default function ImageCarousel({ p }) {
  const [i, setI] = useState(0);
  const [startX, setStartX] = useState(null);
  const go = (n) => setI((n + VIEWS.length) % VIEWS.length);

  // Support swipe navigation on touch devices.
  const onTouchEnd = (e) => {
    if (startX === null) return;
    const d = e.changedTouches[0].clientX - startX;
    if (Math.abs(d) > 40) go(i + (d < 0 ? 1 : -1));
    setStartX(null);
  };

  return (
    <div>
      <div
        onTouchStart={(e) => setStartX(e.touches[0].clientX)}
        onTouchEnd={onTouchEnd}
        className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200"
      >
        <div
          className="absolute inset-0 flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
        >
          {VIEWS.map((v) => (
            <div key={v.label} className="relative flex h-full min-w-full items-center justify-center overflow-hidden">
              <ProductImage p={p} mode={v.mode} className={v.cls} emojiClass="text-9xl" />
            </div>
          ))}
        </div>

        <button
          aria-label="Previous image"
          onClick={() => go(i - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-800 shadow hover:bg-white"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          aria-label="Next image"
          onClick={() => go(i + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-800 shadow hover:bg-white"
        >
          <ChevronRight size={20} />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {VIEWS.map((v, n) => (
            <button
              key={v.label}
              aria-label={`Go to ${v.label}`}
              onClick={() => setI(n)}
              className={`h-2 rounded-full transition-all ${n === i ? "w-6 bg-indigo-600" : "w-2 bg-slate-400/70"}`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="mt-3 flex gap-2">
        {VIEWS.map((v, n) => (
          <button
            key={v.label}
            aria-label={v.label}
            onClick={() => setI(n)}
            className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
              n === i ? "border-indigo-600" : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <ProductImage p={p} mode={v.mode} className={v.cls} emojiClass="text-2xl" />
          </button>
        ))}
      </div>
    </div>
  );
}
