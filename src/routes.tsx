export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  title?: string;
}

import { lazy } from 'react';

// 懒加载页面组件
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Employees = lazy(() => import('@/pages/Employees'));
const Vehicles = lazy(() => import('@/pages/Vehicles'));
const Sales = lazy(() => import('@/pages/Sales'));
const Expenses = lazy(() => import('@/pages/Expenses'));
const Profits = lazy(() => import('@/pages/Profits'));
const Statistics = lazy(() => import('@/pages/Statistics'));
const AdminUsers = lazy(() => import('@/pages/AdminUsers'));
const CustomerView = lazy(() => import('@/pages/CustomerView'));
const InternalReport = lazy(() => import('@/pages/InternalReport'));
const Login = lazy(() => import('@/pages/Login'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Dashboard />,
    title: '仪表盘',
  },
  {
    path: '/employees',
    element: <Employees />,
    title: '员工管理',
  },
  {
    path: '/vehicles',
    element: <Vehicles />,
    title: '车辆管理',
  },
  {
    path: '/sales',
    element: <Sales />,
    title: '销售管理',
  },
  {
    path: '/expenses',
    element: <Expenses />,
    title: '费用管理',
  },
  {
    path: '/profits',
    element: <Profits />,
    title: '利润分配',
  },
  {
    path: '/statistics',
    element: <Statistics />,
    title: '统计分析',
  },
  {
    path: '/admin',
    element: <AdminUsers />,
    title: '用户管理',
  },
  {
    path: '/customer-view',
    element: <CustomerView />,
    title: '客户展示',
  },
  {
    path: '/internal-report',
    element: <InternalReport />,
    title: '内部通报',
  },
  {
    path: '/login',
    element: <Login />,
    title: '登录',
  },
  {
    path: '*',
    element: <NotFound />,
    title: '页面未找到',
  },
];
