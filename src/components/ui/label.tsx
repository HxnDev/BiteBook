import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";
