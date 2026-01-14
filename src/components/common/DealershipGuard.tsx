import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface DealershipGuardProps {
  children: React.ReactNode;
}

/**
 * 车行管理系统权限守卫
 * 只允许有 dealership_id 的用户（车行管理员/员工）访问
 * 平台超级管理员不能访问车行管理系统
 */
export function DealershipGuard({ children }: DealershipGuardProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 权限检查：超级管理员不能访问车行管理系统
  useEffect(() => {
    if (!loading && user && profile) {
      // 如果是超级管理员（没有 dealership_id），跳转到平台管理后台
      if (profile.role === 'super_admin' && !profile.dealership_id) {
        toast.info('提示', {
          description: '平台超级管理员请访问平台管理后台',
        });
        navigate('/platform/dealerships', { replace: true });
      }
      // 如果是车行用户但没有 dealership_id，显示错误
      else if (profile.role !== 'super_admin' && !profile.dealership_id) {
        toast.error('无权访问', {
          description: '您的账号未关联车行，请联系管理员',
        });
        navigate('/login', { replace: true });
      }
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

  // profile 为空，等待加载
  if (!profile) {
    return null;
  }

  // 超级管理员，返回 null（useEffect 会处理跳转）
  if (profile.role === 'super_admin' && !profile.dealership_id) {
    return null;
  }

  // 车行用户但没有 dealership_id，返回 null（useEffect 会处理跳转）
  if (profile.role !== 'super_admin' && !profile.dealership_id) {
    return null;
  }

  // 有 dealership_id 的车行用户，允许访问
  return <>{children}</>;
}
