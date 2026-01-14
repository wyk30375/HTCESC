import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface PlatformGuardProps {
  children: React.ReactNode;
}

/**
 * 平台管理后台权限守卫
 * 只允许 super_admin 角色访问
 */
export function PlatformGuard({ children }: PlatformGuardProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 权限检查：非超级管理员显示提示并跳转
  useEffect(() => {
    if (!loading && user && profile?.role !== 'super_admin') {
      toast.error('无权访问', {
        description: '只有超级管理员可以访问平台管理后台',
      });
      navigate('/', { replace: true });
    }
  }, [loading, user, profile, navigate]);

  // 加载中显示骨架屏
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-12 w-full bg-muted" />
          <Skeleton className="h-12 w-full bg-muted" />
          <Skeleton className="h-12 w-full bg-muted" />
        </div>
      </div>
    );
  }

  // 未登录，跳转到登录页
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 已登录但不是超级管理员，返回 null（useEffect 会处理跳转）
  if (profile?.role !== 'super_admin') {
    return null;
  }

  // 超级管理员，允许访问
  return <>{children}</>;
}
