import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  Car,
  ShoppingCart,
  Receipt,
  PieChart,
  BarChart3,
  UserCog,
  Menu,
  LogOut,
  User,
  Eye,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/employees', label: '员工管理', icon: Users },
  { path: '/vehicles', label: '车辆管理', icon: Car },
  { path: '/sales', label: '销售管理', icon: ShoppingCart },
  { path: '/expenses', label: '费用管理', icon: Receipt },
  { path: '/profits', label: '利润分配', icon: PieChart },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
];

const mobileNavItems = [
  { path: '/customer-view', label: '客户展示', icon: Eye },
  { path: '/internal-report', label: '内部通报', icon: FileText },
];

export default function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('已退出登录');
      navigate('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
      toast.error('退出登录失败');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen w-full">
      {/* 侧边栏 - 桌面端 */}
      <aside className="hidden lg:block w-64 border-r bg-sidebar shrink-0">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
              <Car className="h-6 w-6 text-sidebar-primary" />
              <span className="text-lg">车行管理系统</span>
            </Link>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              {profile?.role === 'admin' && (
                <>
                  <div className="my-4 border-t border-sidebar-border" />
                  <Link
                    to="/admin"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive('/admin')
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <UserCog className="h-4 w-4" />
                    用户管理
                  </Link>
                </>
              )}

              <div className="my-4 border-t border-sidebar-border" />
              <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60">
                手机端
              </div>
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col">
        {/* 顶部导航栏 */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          {/* 移动端菜单按钮 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center border-b px-6">
                  <Link to="/" className="flex items-center gap-2 font-semibold">
                    <Car className="h-6 w-6 text-primary" />
                    <span className="text-lg">车行管理</span>
                  </Link>
                </div>
                <nav className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                            active
                              ? 'bg-accent text-accent-foreground'
                              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}

                    {profile?.role === 'admin' && (
                      <>
                        <div className="my-4 border-t" />
                        <Link
                          to="/admin"
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                            isActive('/admin')
                              ? 'bg-accent text-accent-foreground'
                              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          <UserCog className="h-4 w-4" />
                          用户管理
                        </Link>
                      </>
                    )}

                    <div className="my-4 border-t" />
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                      手机端
                    </div>
                    {mobileNavItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                            active
                              ? 'bg-accent text-accent-foreground'
                              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          {/* 用户菜单 */}
          {user && profile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.role === 'admin' ? '管理员' : '员工'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
