import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

/** Global floating "add recipe" button, hidden on the form itself. */
export function FloatingAddButton() {
  const { pathname } = useLocation();
  if (pathname === "/recipes/new" || pathname.endsWith("/edit")) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="fixed bottom-6 right-6 z-[80] md:bottom-8 md:right-8"
    >
      <Link
        to="/recipes/new"
        aria-label="Add recipe"
        className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="size-6" />
      </Link>
    </motion.div>
  );
}
