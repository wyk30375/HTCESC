import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { RouteGuard } from './components/common/RouteGuard';
import { PlatformGuard } from './components/common/PlatformGuard';
import { DealershipGuard } from './components/common/DealershipGuard';
import Layout from './components/layouts/Layout';
import PlatformLayout from './components/layouts/PlatformLayout';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { 
  routes, 
  Login,
  Dealerships, 
  PlatformStatistics, 
  PlatformSettings, 
  PlatformEmployees, 
  PlatformMembershipManagement 
} from './routes';
import { Skeleton } from './components/ui/skeleton';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 加载中组件
function LoadingFallback() {
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

const App = () => {
  // 获取特殊路由的组件(不需要布局的页面)
  const RegisterComponent = routes.find(r => r.path === '/register')?.component;
  const VehicleListComponent = routes.find(r => r.path === '/vehicle-list')?.component;
  const CustomerViewComponent = routes.find(r => r.path === '/customer-view')?.component;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <AuthProvider>
              <RouteGuard>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* 登录页面、注册页面、车辆列表页面和客户展示页面不需要布局 */}
                    <Route path="/login" element={<Login />} />
                    {RegisterComponent && (
                      <Route path="/register" element={<RegisterComponent />} />
                    )}
                    {VehicleListComponent && (
                      <Route path="/vehicle-list" element={<VehicleListComponent />} />
                    )}
                    {CustomerViewComponent && (
                      <Route path="/customer-view" element={<CustomerViewComponent />} />
                    )}
                    
                    {/* 平台管理后台（超级管理员专用） */}
                    <Route path="/platform" element={
                      <PlatformGuard>
                        <PlatformLayout />
                      </PlatformGuard>
                    }>
                      <Route path="dealerships" element={<Dealerships />} />
                      <Route path="membership" element={<PlatformMembershipManagement />} />
                      <Route path="employees" element={<PlatformEmployees />} />
                      <Route path="statistics" element={<PlatformStatistics />} />
                      <Route path="settings" element={<PlatformSettings />} />
                      <Route index element={<Navigate to="/platform/dealerships" replace />} />
                    </Route>
                    
                    {/* 车行管理系统（车行管理员/员工） */}
                    <Route
                      path="/*"
                      element={
                        <DealershipGuard>
                          <Layout>
                            <Routes>
                              {routes
                                .filter(r => 
                                  r.path !== '/login' && 
                                  r.path !== '/register' && 
                                  r.path !== '/vehicle-list' &&
                                  r.path !== '/customer-view' &&
                                  r.path !== '/dealerships' // 车行管理页面移到平台后台
                                )
                                .map((route) => {
                                  const Component = route.component;
                                  return (
                                    <Route 
                                      key={route.path} 
                                      path={route.path} 
                                      element={<Component />} 
                                    />
                                  );
                                })}
                            </Routes>
                          </Layout>
                        </DealershipGuard>
                      }
                    />
                  </Routes>
                </Suspense>
              </RouteGuard>
            </AuthProvider>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
