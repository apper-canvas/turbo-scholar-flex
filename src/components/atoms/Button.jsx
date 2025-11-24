import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "medium",
  disabled = false,
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl focus:ring-primary/50 transform hover:scale-105 active:scale-95",
    secondary: "border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50 hover:shadow-md transform hover:scale-105 active:scale-95",
    ghost: "text-gray-600 hover:text-primary hover:bg-primary/5 focus:ring-primary/50",
    success: "bg-gradient-to-r from-success to-green-600 text-white hover:from-success/90 hover:to-green-600/90 shadow-lg hover:shadow-xl focus:ring-success/50 transform hover:scale-105 active:scale-95",
    warning: "bg-gradient-to-r from-warning to-orange-600 text-white hover:from-warning/90 hover:to-orange-600/90 shadow-lg hover:shadow-xl focus:ring-warning/50 transform hover:scale-105 active:scale-95",
    danger: "bg-gradient-to-r from-error to-red-600 text-white hover:from-error/90 hover:to-red-600/90 shadow-lg hover:shadow-xl focus:ring-error/50 transform hover:scale-105 active:scale-95"
  };
  
  const sizes = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg"
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;