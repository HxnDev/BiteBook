import { useEffect, useRef } from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  type SpringOptions,
} from "framer-motion";

const DEFAULT_SPRING: SpringOptions = { stiffness: 90, damping: 22, mass: 1 };

export function AnimatedCounter({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  className,
  spring = DEFAULT_SPRING,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  spring?: SpringOptions;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const mv = useMotionValue(0);
  const spv = useSpring(mv, spring);

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  useEffect(() => {
    return spv.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      }
    });
  }, [spv, decimals, suffix, prefix]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {(0).toFixed(decimals)}
      {suffix}
    </span>
  );
}
