import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Textarea = forwardRef(({ 
  className,
  error = false,
  rows = 3,
  ...props 
}, ref) => {
  return (
    <textarea
      rows={rows}
      className={cn(
        "flex w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg bg-white placeholder:text-gray-400 resize-none",
        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        "transition-all duration-200",
        error && "border-error focus:border-error focus:ring-error/20",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;