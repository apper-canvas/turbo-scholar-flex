import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Select = forwardRef(({ 
  className,
  error = false,
  children,
  ...props 
}, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex w-full px-4 py-2.5 pr-10 text-base border border-gray-300 rounded-lg bg-white",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          "transition-all duration-200 appearance-none",
          error && "border-error focus:border-error focus:ring-error/20",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ApperIcon name="ChevronDown" className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
});

Select.displayName = "Select";

export default Select;