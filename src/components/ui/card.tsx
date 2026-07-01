import { View, type ViewProps } from 'react-native';
import { cn } from '~/lib/utils/helpers';

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <View
      className={cn('rounded-2xl border border-border bg-card p-4', className)}
      {...props}
    >
      {children}
    </View>
  );
}
