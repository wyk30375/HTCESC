import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  headerClassName?: string;
}

/**
 * 页面包装组件 - 为所有页面提供统一的背景和样式
 */
export function PageWrapper({ 
  children, 
  title, 
  description, 
  className,
  headerClassName 
}: PageWrapperProps) {
  return (
    <div className={cn("space-y-4 sm:space-y-6 p-4 sm:p-6", className)}>
      {(title || description) && (
        <div className={cn("page-header-bg rounded-xl p-4 sm:p-6 shadow-lg", headerClassName)}>
          {title && <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>}
          {description && <p className="text-white/90 mt-2 text-sm sm:text-base">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
