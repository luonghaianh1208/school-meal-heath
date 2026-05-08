import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("bg-white rounded-2xl shadow-sm border border-slate-100 p-4", className)} {...props} />
  )
)
Card.displayName = "Card"

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost', size?: 'default' | 'sm' | 'lg' | 'icon' }>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const variants = {
      primary: "bg-green-600 hover:bg-green-700 text-white shadow-sm",
      secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800",
      danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm",
      outline: "border border-slate-200 hover:bg-slate-50 text-slate-700",
      ghost: "hover:bg-slate-100 text-slate-700"
    };
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };
    return (
      <button ref={ref} className={cn("inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 disabled:hover:translate-y-0", variants[variant], sizes[size], className)} {...props} />
    )
  }
)
Button.displayName = "Button"

export const Badge = ({ className, severity, children, ...props }: React.HTMLAttributes<HTMLSpanElement> & { severity?: 'low' | 'medium' | 'high' | 'info' | 'success' }) => {
  const severities = {
    low: "bg-blue-50 text-blue-700 ring-blue-500/30",
    medium: "bg-amber-50 text-amber-700 ring-amber-500/30",
    high: "bg-red-50 text-red-700 ring-red-500/30",
    info: "bg-slate-100 text-slate-700 ring-slate-500/30",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-500/30"
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", severity ? severities[severity] : severities.info, className)} {...props}>
      {children}
    </span>
  )
}

export const ProgressBar = ({ progress, className, colorClass = "bg-green-500" }: { progress: number, className?: string, colorClass?: string }) => (
    <div className={cn("w-full bg-slate-100 rounded-full h-2.5 overflow-hidden", className)}>
        <div className={cn("h-2.5 rounded-full transition-all duration-300", colorClass)} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}></div>
    </div>
)
