import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { easeOutExpo } from "@/lib/motion";

const WORDS = ["Preheating", "Plating up", "Folding in flavour", "Almost served"];

export function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    let raf = 0;
    let current = 0;
    let assetsReady = false;

    const markReady = () => {
      assetsReady = true;
    };
    if (document.readyState === "complete") markReady();
    else window.addEventListener("load", markReady, { once: true });
    if ("fonts" in document) {
      (document as Document).fonts.ready.then(markReady);
    }

    const tick = () => {
      const ceiling = assetsReady ? 100 : 92;
      const step = (ceiling - current) * 0.06 + 0.4;
      current = Math.min(ceiling, current + step);
      setProgress(current);

      if (current >= 99.5 && assetsReady && !doneRef.current) {
        doneRef.current = true;
        setProgress(100);
        setTimeout(() => setExiting(true), 360);
        setTimeout(onDone, 1100);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", markReady);
    };
  }, [onDone]);

  const wordIndex = Math.min(
    WORDS.length - 1,
    Math.floor((progress / 100) * WORDS.length),
  );
  const padded = String(Math.round(progress)).padStart(3, "0");

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-espresso-950"
      initial={{ opacity: 1 }}
      animate={exiting ? { y: "-100%" } : { y: 0 }}
      transition={{ duration: 0.9, ease: easeOutExpo }}
    >
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative flex flex-col items-center gap-6"
      >
        <span className="font-display text-2xl tracking-tight text-foreground">
          Bite<span className="text-primary">Book</span>
        </span>

        <div className="relative h-[1px] w-56 overflow-hidden bg-foreground/15">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-saffron to-ember-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex w-56 items-baseline justify-between">
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {WORDS[wordIndex]}
          </span>
          <span className="font-display text-3xl tabular-nums text-foreground">
            {padded}
            <span className="text-primary">%</span>
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
