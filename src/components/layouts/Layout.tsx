import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import DealershipName from '@/components/DealershipName';
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
  Settings,
  Building2,
  Crown,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { feedbackApi } from '@/db/api';
import { Badge } from '@/components/ui/badge';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard, roles: ['admin', 'employee'], group: 'overview' },
  { path: '/employees', label: '员工管理', icon: Users, roles: ['admin'], group: 'business' },
  { path: '/vehicles', label: '车辆管理', icon: Car, roles: ['admin', 'employee'], group: 'business' },
  { path: '/sales', label: '销售管理', icon: ShoppingCart, roles: ['admin', 'employee'], group: 'business' },
  { path: '/expenses', label: '费用管理', icon: Receipt, roles: ['admin', 'employee'], group: 'finance' },
  { path: '/profits', label: '利润分配', icon: PieChart, roles: ['admin', 'employee'], group: 'finance' },
  { path: '/statistics', label: '统计分析', icon: BarChart3, roles: ['admin', 'employee'], group: 'analytics' },
  { path: '/feedback', label: '反馈中心', icon: MessageSquare, roles: ['admin'], group: 'support' },
  { path: '/profit-rules', label: '提成规则', icon: Settings, roles: ['admin'], group: 'settings' },
  { path: '/dealership-settings', label: '车行信息', icon: Building2, roles: ['admin'], group: 'settings' },
  { path: '/membership', label: '会员中心', icon: Crown, roles: ['admin'], group: 'settings' },
];

const navGroups = [
  { key: 'overview', label: '概览' },
  { key: 'business', label: '业务管理' },
  { key: 'finance', label: '财务管理' },
  { key: 'analytics', label: '数据分析' },
  { key: 'support', label: '客服支持' },
  { key: 'settings', label: '系统设置' },
];

const mobileNavItems = [
  { path: '/customer-view', label: '客户展示', icon: Eye },
  { path: '/internal-report', label: '内部通报', icon: FileText },
];

export default function Layout({ children }: LayoutProps) {
  const { user, profile, dealership, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 加载未读消息数量
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await feedbackApi.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('加载未读消息数量失败:', error);
      }
    };
    loadUnreadCount();
    // 每30秒刷新一次
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // 根据用户角色过滤菜单项
  const filteredNavItems = navItems.filter(item => {
    if (!profile?.role) return false;
    return item.roles.includes(profile.role);
  });

  // 关闭移动端菜单
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* 侧边栏 - 桌面端 */}
      <aside className="hidden lg:block w-64 border-r bg-sidebar shrink-0">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
              <Car className="h-6 w-6 text-sidebar-primary" />
              {dealership ? (
                <DealershipName 
                  name={dealership.name} 
                  variant="sidebar" 
                  showCode={true} 
                  code={dealership.code} 
                />
              ) : (
                <span className="text-lg">车行管理系统</span>
              )}
            </Link>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navGroups.map((group, groupIndex) => {
                // 获取当前分组的菜单项
                const groupItems = filteredNavItems.filter(item => item.group === group.key);
                
                // 如果当前分组没有菜单项，不显示
                if (groupItems.length === 0) return null;
                
                return (
                  <div key={group.key}>
                    {/* 分组标题（第一个分组不显示分隔线） */}
                    {groupIndex > 0 && <div className="my-4 border-t border-sidebar-border" />}
                    <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60">
                      {group.label}
                    </div>
                    
                    {/* 分组内的菜单项 */}
                    {groupItems.map((item) => {
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
                          <span className="flex-1">{item.label}</span>
                          {item.path === '/feedback' && unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}

              {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
                <>
                  <div className="my-4 border-t border-sidebar-border" />
                  <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60">
                    管理员
                  </div>
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
        {/* 顶部导航栏 - 固定定位 */}
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-primary px-4 lg:px-6">
          {/* 移动端菜单按钮 */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center border-b px-6">
                  <Link to="/" className="flex items-center gap-2 font-semibold" onClick={closeMobileMenu}>
                    <Car className="h-6 w-6 text-primary" />
                    <span className="text-lg">车行管理</span>
                  </Link>
                </div>
                <nav className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-1">
                    {navGroups.map((group, groupIndex) => {
                      // 获取当前分组的菜单项
                      const groupItems = filteredNavItems.filter(item => item.group === group.key);
                      
                      // 如果当前分组没有菜单项，不显示
                      if (groupItems.length === 0) return null;
                      
                      return (
                        <div key={group.key}>
                          {/* 分组标题（第一个分组不显示分隔线） */}
                          {groupIndex > 0 && <div className="my-4 border-t" />}
                          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                            {group.label}
                          </div>
                          
                          {/* 分组内的菜单项 */}
                          {groupItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={closeMobileMenu}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                  active
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                <span className="flex-1">{item.label}</span>
                                {item.path === '/feedback' && unreadCount > 0 && (
                                  <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">
                                    {unreadCount}
                                  </Badge>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      );
                    })}

                    {profile?.role === 'admin' && (
                      <>
                        <div className="my-4 border-t" />
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                          管理员
                        </div>
                        <Link
                          to="/admin"
                          onClick={closeMobileMenu}
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
                          onClick={closeMobileMenu}
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

          {/* 中间标题 */}
          <div className="flex-1 flex justify-center">
            {dealership ? (
              <DealershipName 
                name={dealership.name} 
                variant="header" 
              />
            ) : (
              <h1 className="text-xl font-bold text-primary-foreground">
                二手车销售管理系统
              </h1>
            )}
          </div>

          {/* 用户菜单 */}
          {user && profile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-primary-foreground hover:bg-primary-foreground/10">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.role === 'super_admin' 
                        ? '平台超级管理员' 
                        : profile.role === 'admin' 
                        ? '车行管理员' 
                        : '员工'}
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
