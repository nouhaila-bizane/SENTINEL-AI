import { cn } from '../utils/cn';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-sentinel-blue to-sentinel-cyan text-white hover:opacity-90 shadow-lg shadow-sentinel-blue/20',
      secondary: 'bg-sentinel-card border border-sentinel-border text-sentinel-text hover:border-sentinel-cyan/50',
      danger: 'bg-sentinel-danger/10 border border-sentinel-danger/30 text-sentinel-danger hover:bg-sentinel-danger/20',
      ghost: 'text-sentinel-muted hover:text-sentinel-text hover:bg-sentinel-card',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full bg-sentinel-bg border border-sentinel-border rounded-lg px-4 py-2.5 text-sentinel-text placeholder:text-sentinel-muted/60 focus:outline-none focus:border-sentinel-cyan focus:ring-1 focus:ring-sentinel-cyan/30 transition',
        className
      )}
      {...props}
    />
  )
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full bg-sentinel-bg border border-sentinel-border rounded-lg px-4 py-2.5 text-sentinel-text placeholder:text-sentinel-muted/60 focus:outline-none focus:border-sentinel-cyan focus:ring-1 focus:ring-sentinel-cyan/30 transition resize-none',
        className
      )}
      {...props}
    />
  )
);

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('bg-sentinel-card border border-sentinel-border rounded-xl', className)}
    {...props}
  >
    {children}
  </div>
);

export const Badge = ({ children, variant = 'default', className }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'; className?: string }) => {
  const variants = {
    default: 'bg-sentinel-border/50 text-sentinel-muted border-sentinel-border',
    success: 'bg-sentinel-success/10 text-sentinel-success border-sentinel-success/30',
    warning: 'bg-sentinel-warning/10 text-sentinel-warning border-sentinel-warning/30',
    danger: 'bg-sentinel-danger/10 text-sentinel-danger border-sentinel-danger/30',
    info: 'bg-sentinel-blue/10 text-sentinel-blue border-sentinel-blue/30',
    purple: 'bg-sentinel-purple/10 text-sentinel-purple border-sentinel-purple/30',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', variants[variant], className)}>
      {children}
    </span>
  );
};

export const Spinner = ({ size = 20 }: { size?: number }) => (
  <Loader2 className="animate-spin text-sentinel-cyan" size={size} />
);

export const EmptyState = ({ icon: Icon, title, description, action }: { icon: any; title: string; description: string; action?: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-sentinel-card border border-sentinel-border flex items-center justify-center mb-4">
      <Icon className="text-sentinel-muted" size={28} />
    </div>
    <h3 className="text-lg font-semibold text-sentinel-text mb-1">{title}</h3>
    <p className="text-sentinel-muted text-sm max-w-md mb-4">{description}</p>
    {action}
  </div>
);

export const StatCard = ({ label, value, icon: Icon, accent = 'cyan' }: { label: string; value: string | number; icon: any; accent?: 'cyan' | 'blue' | 'purple' | 'success' | 'warning' | 'danger' }) => {
  const accents = {
    cyan: 'text-sentinel-cyan bg-sentinel-cyan/10',
    blue: 'text-sentinel-blue bg-sentinel-blue/10',
    purple: 'text-sentinel-purple bg-sentinel-purple/10',
    success: 'text-sentinel-success bg-sentinel-success/10',
    warning: 'text-sentinel-warning bg-sentinel-warning/10',
    danger: 'text-sentinel-danger bg-sentinel-danger/10',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sentinel-muted text-sm">{label}</p>
          <p className="text-2xl font-bold text-sentinel-text mt-1">{value}</p>
        </div>
        <div className={cn('p-2 rounded-lg', accents[accent])}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
};