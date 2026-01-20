import { Car } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export default function BrandLogo({ size = 'md', showSubtitle = true, className = '' }: BrandLogoProps) {
  const sizeClasses = {
    sm: {
      container: 'gap-2',
      iconWrapper: 'w-8 h-8',
      icon: 'h-5 w-5',
      text: 'text-lg',
      subtitle: 'text-xs',
    },
    md: {
      container: 'gap-2',
      iconWrapper: 'w-10 h-10',
      icon: 'h-6 w-6',
      text: 'text-xl',
      subtitle: 'text-xs',
    },
    lg: {
      container: 'gap-3',
      iconWrapper: 'w-12 h-12',
      icon: 'h-7 w-7',
      text: 'text-2xl',
      subtitle: 'text-sm',
    },
    xl: {
      container: 'gap-4',
      iconWrapper: 'w-16 h-16',
      icon: 'h-10 w-10',
      text: 'text-3xl',
      subtitle: 'text-base',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      {/* 图标容器 - 使用渐变背景和阴影 */}
      <div 
        className={`
          flex items-center justify-center ${currentSize.iconWrapper} rounded-xl
          bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500
          shadow-lg shadow-purple-500/30
          relative overflow-hidden
          group
        `}
      >
        {/* 光晕效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* 汽车图标 */}
        <Car className={`${currentSize.icon} text-white relative z-10 drop-shadow-md`} />
      </div>
      
      {/* 文字部分 */}
      <div className="flex flex-col">
        {/* 品牌名称 - 使用渐变文字 */}
        <span 
          className={`
            ${currentSize.text} font-black tracking-tight
            bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
            bg-clip-text text-transparent
            drop-shadow-sm
          `}
          style={{
            fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          恏淘车
        </span>
        
        {/* 副标题 */}
        {showSubtitle && (
          <p className={`${currentSize.subtitle} text-muted-foreground font-medium`}>
            二手车经营管理平台
          </p>
        )}
      </div>
    </div>
  );
}
