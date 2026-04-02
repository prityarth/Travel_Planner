import { cn } from '../utils/cn';

export function Spinner({ className }) {
  return (
    <div className={cn("flex justify-center items-center py-8", className)}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
    </div>
  );
}
