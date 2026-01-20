interface DealershipNameProps {
  name: string;
  variant?: 'default' | 'sidebar' | 'header' | 'large';
  showCode?: boolean;
  code?: string;
  className?: string;
}

export default function DealershipName({ 
  name, 
  variant = 'default', 
  showCode = false, 
  code,
  className = '' 
}: DealershipNameProps) {
  const variantStyles = {
    default: {
      container: 'flex flex-col',
      name: 'text-lg font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent',
      code: 'text-xs text-muted-foreground font-normal mt-0.5',
    },
    sidebar: {
      container: 'flex flex-col',
      name: 'text-lg font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-sm',
      code: 'text-xs text-muted-foreground font-normal mt-0.5',
    },
    header: {
      container: 'flex flex-col items-center',
      name: 'text-xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-orange-300 to-red-300 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
      code: 'text-xs text-white/80 font-normal mt-0.5',
    },
    large: {
      container: 'flex flex-col',
      name: 'text-2xl font-black tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-sm',
      code: 'text-sm text-muted-foreground font-normal mt-1',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.container} ${className}`}>
      <span 
        className={styles.name}
        style={{
          fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
          letterSpacing: variant === 'header' ? '0.02em' : '0.01em',
        }}
      >
        {name}
      </span>
      {showCode && code && (
        <span className={styles.code}>
          {code}
        </span>
      )}
    </div>
  );
}
