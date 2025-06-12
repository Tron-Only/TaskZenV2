import type { LucideProps } from 'lucide-react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { Priority } from '@/types';
import { cn } from '@/lib/utils';

interface PriorityIconProps {
  priority: Priority;
  className?: string;
  iconProps?: Omit<LucideProps, 'className'>;
}

export function PriorityIcon({ priority, className, iconProps }: PriorityIconProps) {
  const baseIconProps = { size: 16, ...iconProps };
  switch (priority) {
    case 'High':
      return <ArrowUp className={cn('text-destructive', className)} {...baseIconProps} />;
    case 'Medium':
      return <Minus className={cn('[color:hsl(var(--chart-4))]', className)} {...baseIconProps} />;
    case 'Low':
      return <ArrowDown className={cn('[color:hsl(var(--chart-2))]', className)} {...baseIconProps} />;
    default:
      return null;
  }
}
