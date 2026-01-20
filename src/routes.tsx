import type { ComponentType } from 'react';

// 所有页面直接导入，不使用懒加载
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Employees from '@/pages/Employees';
import Vehicles from '@/pages/Vehicles';
import Sales from '@/pages/Sales';
import Expenses from '@/pages/Expenses';
import Profits from '@/pages/Profits';
import ProfitRules from '@/pages/ProfitRules';
import Statistics from '@/pages/Statistics';
import Dealerships from '@/pages/Dealerships';
import DealershipRegister from '@/pages/DealershipRegister';
import DealershipSettings from '@/pages/DealershipSettings';
import PlatformStatistics from '@/pages/PlatformStatistics';
import PlatformSettings from '@/pages/PlatformSettings';
import PlatformEmployees from '@/pages/PlatformEmployees';
import PlatformMembershipManagement from '@/pages/PlatformMembershipManagement';
import MembershipCenter from '@/pages/MembershipCenter';
import InternalReport from '@/pages/InternalReport';
import VehicleList from '@/pages/VehicleList';
import CustomerView from '@/pages/CustomerView';
import PublicHome from '@/pages/PublicHome';
import PublicHomeNew from '@/pages/PublicHomeNew';
import Index from '@/pages/Index';
import AdminUsers from '@/pages/AdminUsers';
import UserDebug from '@/pages/UserDebug';
import CarListings from '@/pages/CarListings';
import CarDetail from '@/pages/CarDetail';
import Appointment from '@/pages/Appointment';
import AboutUs from '@/pages/AboutUs';
import Contact from '@/pages/Contact';
import GarageServices from '@/pages/GarageServices';
import FeedbackCenter from '@/pages/FeedbackCenter';
import PlatformFeedback from '@/pages/PlatformFeedback';

export interface RouteConfig {
  path: string;
  component: ComponentType;
  title?: string;
}

// 导出所有页面组件
export {
  Dashboard,
  Login,
  NotFound,
  Employees,
  Vehicles,
  Sales,
  Expenses,
  Profits,
  ProfitRules,
  Statistics,
  Dealerships,
  DealershipRegister,
  DealershipSettings,
  PlatformStatistics,
  PlatformSettings,
  PlatformEmployees,
  PlatformMembershipManagement,
  MembershipCenter,
  InternalReport,
  VehicleList,
  CustomerView,
  PublicHome,
  PublicHomeNew,
  Index,
  AdminUsers,
  UserDebug,
  CarListings,
  CarDetail,
  Appointment,
  AboutUs,
  Contact,
  GarageServices,
  FeedbackCenter,
  PlatformFeedback,
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
    path: '/feedback',
    component: FeedbackCenter,
    title: '反馈中心',
  },
  {
    path: '/platform-feedback',
    component: PlatformFeedback,
    title: '反馈管理',
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
