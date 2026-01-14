import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Building2, BarChart3, Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function PlatformLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigation = [
    { name: '车行管理', path: '/platform/dealerships', icon: Building2 },
    { name: '平台统计', path: '/platform/statistics', icon: BarChart3 },
    { name: '系统设置', path: '/platform/settings', icon: Settings },
  ];

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive(item.path)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* 桌面端侧边栏 */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border bg-sidebar">
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-sidebar-foreground">平台管理后台</span>
              <span className="text-xs text-muted-foreground">超级管理员</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <NavLinks />
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {profile?.username?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.username || '管理员'}
              </p>
              <p className="text-xs text-muted-foreground">超级管理员</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 mt-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </div>
      </aside>

      {/* 移动端顶部栏 */}
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b border-border px-6">
                <div className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">平台管理后台</span>
                    <span className="text-xs text-muted-foreground">超级管理员</span>
                  </div>
                </div>
              </div>
              <nav className="flex-1 space-y-1 p-4">
                <NavLinks />
              </nav>
              <div className="border-t border-border p-4">
                <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {profile?.username?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {profile?.username || '管理员'}
                    </p>
                    <p className="text-xs text-muted-foreground">超级管理员</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 mt-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">平台管理后台</span>
          </div>
        </header>

        {/* 主内容区域 */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
