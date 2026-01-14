import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/common/PageWrapper';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function UserDebug() {
  const { user, profile, refreshProfile } = useAuth();

  const handleRefresh = async () => {
    try {
      await refreshProfile();
      toast.success('用户信息已刷新');
    } catch (error) {
      toast.error('刷新失败');
    }
  };

  return (
    <PageWrapper>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">用户信息调试</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              查看当前登录用户的详细信息
            </p>
          </div>
          <Button onClick={handleRefresh} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新用户信息
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile 数据（来自 profiles 表）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <p className="break-all">{profile?.id || '未加载'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">用户名:</span>
                  <p className="text-lg font-bold text-primary">{profile?.username || '未加载'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">邮箱:</span>
                  <p>{profile?.email || '未加载'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">角色:</span>
                  <p>{profile?.role || '未加载'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">手机号:</span>
                  <p>{profile?.phone || '未设置'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">状态:</span>
                  <p>{profile?.status || '未设置'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auth User 数据（来自 auth.users 表）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <p className="break-all">{user?.id || '未加载'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">邮箱:</span>
                  <p>{user?.email || '未加载'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">创建时间:</span>
                  <p>{user?.created_at || '未加载'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">最后登录:</span>
                  <p>{user?.last_sign_in_at || '未加载'}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-muted-foreground">User Metadata:</span>
                <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto">
                  {JSON.stringify(user?.user_metadata, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <p className="font-medium text-primary">💡 调试说明</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>如果用户名显示不正确，请点击"刷新用户信息"按钮</li>
                <li>如果刷新后仍不正确，请退出登录后重新登录</li>
                <li>Profile 数据来自 profiles 表，这是显示在界面上的数据</li>
                <li>Auth User 数据来自 auth.users 表，这是认证系统的数据</li>
                <li>用户名应该显示为中文（如：吴韩）</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
