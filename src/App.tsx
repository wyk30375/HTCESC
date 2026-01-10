import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { RouteGuard } from './components/common/RouteGuard';
import Layout from './components/layouts/Layout';
import { routes } from './routes';
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

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <RouteGuard>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* 登录页面和客户展示页面不需要布局 */}
                  <Route path="/login" element={routes.find(r => r.path === '/login')?.element} />
                  <Route path="/customer-view" element={routes.find(r => r.path === '/customer-view')?.element} />
                  
                  {/* 其他页面使用布局 */}
                  <Route
                    path="/*"
                    element={
                      <Layout>
                        <Routes>
                          {routes
                            .filter(r => r.path !== '/login' && r.path !== '/customer-view')
                            .map((route) => (
                              <Route key={route.path} path={route.path} element={route.element} />
                            ))}
                        </Routes>
                      </Layout>
                    }
                  />
                </Routes>
              </Suspense>
            </RouteGuard>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
