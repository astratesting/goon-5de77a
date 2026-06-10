import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text-dim">{label}</label>
        )}
        <textarea
          ref={ref}
          className={`min-h-[80px] px-3 py-2 bg-ink-2 border border-border rounded-input text-text text-base placeholder:text-text-faint focus:border-indigo focus:ring-1 focus:ring-indigo/30 transition-all duration-120 resize-y ${
            error ? "border-red" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
