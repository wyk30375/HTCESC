import { useAuth } from '@/context/AuthContext';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Building2, Mail } from 'lucide-react';

export default function RoleDebug() {
  const { user, profile, dealership } = useAuth();
  const navigate = useNavigate();

  return (
    <PageWrapper title="角色调试" description="查看当前用户角色和权限信息">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              用户信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">用户 ID</div>
                <div className="font-mono text-sm">{user?.id || '未登录'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">邮箱</div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user?.email || '未登录'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              角色信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">当前角色</div>
                <div className="flex items-center gap-2">
                  {profile?.role === 'super_admin' && (
                    <Badge variant="destructive" className="text-base">
                      平台超级管理员
                    </Badge>
                  )}
                  {profile?.role === 'admin' && (
                    <Badge variant="default" className="text-base">
                      车行管理员
                    </Badge>
                  )}
                  {profile?.role === 'employee' && (
                    <Badge variant="secondary" className="text-base">
                      员工
                    </Badge>
                  )}
                  {!profile?.role && (
                    <Badge variant="outline" className="text-base">
                      未知角色
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">角色代码</div>
                <div className="font-mono text-sm">{profile?.role || '无'}</div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-2">权限说明</div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {profile?.role === 'super_admin' && (
                  <>
                    <li>✅ 可以访问平台管理菜单</li>
                    <li>✅ 可以管理所有车行</li>
                    <li>✅ 可以查看和回复车行反馈</li>
                    <li>✅ 可以向车行发送提醒</li>
                  </>
                )}
                {profile?.role === 'admin' && (
                  <>
                    <li>✅ 可以管理本车行员工</li>
                    <li>✅ 可以管理车辆和销售</li>
                    <li>✅ 可以向平台提交反馈</li>
                    <li>❌ 无法访问平台管理功能</li>
                  </>
                )}
                {profile?.role === 'employee' && (
                  <>
                    <li>✅ 可以查看车辆信息</li>
                    <li>✅ 可以记录销售</li>
                    <li>❌ 无法管理员工</li>
                    <li>❌ 无法访问平台管理功能</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              车行信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">车行 ID</div>
                <div className="font-mono text-sm">{profile?.dealership_id || '无（平台管理员）'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">车行名称</div>
                <div>{dealership?.name || '无'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快速导航</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile?.role === 'super_admin' && (
              <>
                <Button
                  onClick={() => navigate('/platform-feedback')}
                  className="w-full"
                >
                  前往反馈管理
                </Button>
                <Button
                  onClick={() => navigate('/dealerships')}
                  variant="outline"
                  className="w-full"
                >
                  前往车行管理
                </Button>
                <Button
                  onClick={() => navigate('/platform-membership')}
                  variant="outline"
                  className="w-full"
                >
                  前往会员管理
                </Button>
              </>
            )}
            {profile?.role === 'admin' && (
              <>
                <Button
                  onClick={() => navigate('/feedback')}
                  className="w-full"
                >
                  前往反馈中心
                </Button>
                <Button
                  onClick={() => navigate('/employees')}
                  variant="outline"
                  className="w-full"
                >
                  前往员工管理
                </Button>
              </>
            )}
            <Button
              onClick={() => navigate('/')}
              variant="secondary"
              className="w-full"
            >
              返回首页
            </Button>
          </CardContent>
        </Card>

        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="text-amber-900 dark:text-amber-100">
              ⚠️ 如果看不到反馈管理菜单
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-900 dark:text-amber-100 space-y-2">
            <p className="text-sm">请检查以下几点：</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>确认当前角色是 <strong>super_admin</strong>（平台超级管理员）</li>
              <li>如果是车行管理员（admin），需要切换到平台管理员账号</li>
              <li>平台管理员账号：<strong>wh@yichi.internal</strong></li>
              <li>刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）清除缓存</li>
              <li>检查侧边栏是否有"平台管理"分组</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
