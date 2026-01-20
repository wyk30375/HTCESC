import { type ComponentType } from 'react';
// 所有页面改为直接导入，避免动态导入失败
import Dashboard from '@/pages/Dashboard';
import Employees from '@/pages/Employees';
import Vehicles from '@/pages/Vehicles';
import Sales from '@/pages/Sales';
import Expenses from '@/pages/Expenses';
import Profits from '@/pages/Profits';
import ProfitRules from '@/pages/ProfitRules';
import Statistics from '@/pages/Statistics';
import AdminUsers from '@/pages/AdminUsers';
import UserDebug from '@/pages/UserDebug';
import Dealerships from '@/pages/Dealerships';
import PlatformStatistics from '@/pages/PlatformStatistics';
import PlatformSettings from '@/pages/PlatformSettings';
import PlatformEmployees from '@/pages/PlatformEmployees';
import DealershipSettings from '@/pages/DealershipSettings';
import MembershipCenter from '@/pages/MembershipCenter';
import PlatformMembershipManagement from '@/pages/PlatformMembershipManagement';
import PublicHomeNew from '@/pages/PublicHomeNew';
import VehicleList from '@/pages/VehicleList';
import CustomerView from '@/pages/CustomerView';
import InternalReport from '@/pages/InternalReport';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';

export interface RouteConfig {
  path: string;
  component: ComponentType;
  title?: string;
}

// 导出所有页面组件
export {
  Dashboard,
  Employees,
  Vehicles,
  Sales,
  Expenses,
  Profits,
  ProfitRules,
  Statistics,
  AdminUsers,
  UserDebug,
  Dealerships,
  PlatformStatistics,
  PlatformSettings,
  PlatformEmployees,
  DealershipSettings,
  MembershipCenter,
  PlatformMembershipManagement,
  PublicHomeNew,
  VehicleList,
  CustomerView,
  InternalReport,
  Login,
  NotFound,
};

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
    path: '/dealership-settings',
    component: DealershipSettings,
    title: '车行信息',
  },
  {
    path: '/membership',
    component: MembershipCenter,
    title: '会员中心',
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
    path: '/platform-membership',
    component: PlatformMembershipManagement,
    title: '会员管理',
  },
  {
    path: '/register',
    component: PublicHomeNew,
    title: '恏淘车经营管理平台',
  },
  {
    path: '/vehicle-list',
    component: VehicleList,
    title: '全部车辆',
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
