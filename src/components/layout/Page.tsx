import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.main
      variants={pageTransition}
      initial="initial"
      animate="enter"
      exit="exit"
      className={cn("min-h-[100svh]", className)}
    >
      {children}
    </motion.main>
  );
}
