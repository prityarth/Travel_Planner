import { cn } from '../utils/cn';

export function GlassCard({ children, className, dark = false, ...props }) {
  return (
    <div 
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        dark ? "glass-dark" : "glass",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
