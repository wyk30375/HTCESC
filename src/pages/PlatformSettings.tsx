import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function PlatformSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">系统设置</h1>
        <p className="text-muted-foreground mt-2">
          配置平台参数和系统设置
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            功能开发中
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            系统设置功能正在开发中，敬请期待...
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• 平台基本信息设置</li>
            <li>• 审核规则配置</li>
            <li>• 通知设置</li>
            <li>• 权限管理</li>
            <li>• 系统日志</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
