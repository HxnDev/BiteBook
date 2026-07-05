import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export function Reveal({
  children,
  className,
  variants = fadeUp,
  amount = 0.3,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  amount?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </motion.div>
  );
}
