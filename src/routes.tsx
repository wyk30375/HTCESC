import { lazy, type ComponentType } from 'react';

export interface RouteConfig {
  path: string;
  component: ComponentType;
  title?: string;
}

// 懒加载页面组件
export const Dashboard = lazy(() => import('@/pages/Dashboard'));
export const Employees = lazy(() => import('@/pages/Employees'));
export const Vehicles = lazy(() => import('@/pages/Vehicles'));
export const Sales = lazy(() => import('@/pages/Sales'));
export const Expenses = lazy(() => import('@/pages/Expenses'));
export const Profits = lazy(() => import('@/pages/Profits'));
export const ProfitRules = lazy(() => import('@/pages/ProfitRules'));
export const Statistics = lazy(() => import('@/pages/Statistics'));
export const AdminUsers = lazy(() => import('@/pages/AdminUsers'));
export const UserDebug = lazy(() => import('@/pages/UserDebug'));
export const Dealerships = lazy(() => import('@/pages/Dealerships'));
export const PlatformStatistics = lazy(() => import('@/pages/PlatformStatistics'));
export const PlatformSettings = lazy(() => import('@/pages/PlatformSettings'));
export const PublicHomeNew = lazy(() => import('@/pages/PublicHomeNew'));
export const CustomerView = lazy(() => import('@/pages/CustomerView'));
export const InternalReport = lazy(() => import('@/pages/InternalReport'));
export const Login = lazy(() => import('@/pages/Login'));
export const NotFound = lazy(() => import('@/pages/NotFound'));

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: Dashboard,
    title: '仪表盘',
  },
  {
    path: '/employees',
    component: Employees,
    title: '员工管理',
  },
  {
    path: '/vehicles',
    component: Vehicles,
    title: '车辆管理',
  },
  {
    path: '/sales',
    component: Sales,
    title: '销售管理',
  },
  {
    path: '/expenses',
    component: Expenses,
    title: '费用管理',
  },
  {
    path: '/profits',
    component: Profits,
    title: '利润分配',
  },
  {
    path: '/profit-rules',
    component: ProfitRules,
    title: '提成规则',
  },
  {
    path: '/statistics',
    component: Statistics,
    title: '统计分析',
  },
  {
    path: '/admin',
    component: AdminUsers,
    title: '用户管理',
  },
  {
    path: '/user-debug',
    component: UserDebug,
    title: '用户调试',
  },
  {
    path: '/dealerships',
    component: Dealerships,
    title: '车行管理',
  },
  {
    path: '/register',
    component: PublicHomeNew,
    title: '恏淘车经营管理平台',
  },
  {
    path: '/customer-view',
    component: CustomerView,
    title: '客户展示',
  },
  {
    path: '/internal-report',
    component: InternalReport,
    title: '内部通报',
  },
  {
    path: '/login',
    component: Login,
    title: '登录',
  },
  {
    path: '*',
    component: NotFound,
    title: '页面未找到',
  },
];
