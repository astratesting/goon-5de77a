import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, disabled, className = "", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium transition-all duration-120 ease-out rounded-input select-none";

    const variants = {
      primary: "bg-indigo text-white hover:brightness-110 active:brightness-90 disabled:opacity-40",
      secondary:
        "bg-ink-3 text-text border border-border hover:bg-ink-3/80 active:bg-border disabled:opacity-40",
      ghost: "text-text-dim hover:text-text hover:bg-ink-3 active:bg-border disabled:opacity-40",
      danger: "bg-red/10 text-red border border-red/20 hover:bg-red/20 active:bg-red/30 disabled:opacity-40",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-base gap-2",
      lg: "h-12 px-6 text-lg gap-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
