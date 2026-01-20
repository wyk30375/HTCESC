import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { Loader2, User, Shield, KeyRound } from 'lucide-react';

export default function EmployeeProfile() {
  const { profile } = useAuth();
  
  // 密码修改相关状态
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // 修改密码
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('请填写所有密码字段');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('新密码长度至少为6位');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('两次输入的新密码不一致');
      return;
    }

    if (oldPassword === newPassword) {
      toast.error('新密码不能与旧密码相同');
      return;
    }

    if (!profile?.username) {
      toast.error('无法获取用户信息');
      return;
    }

    setChangingPassword(true);
    try {
      // 调用 Edge Function 修改密码（适用于所有员工）
      const { data, error } = await supabase.functions.invoke('change-password', {
        body: {
          username: profile.username,
          oldPassword: oldPassword,
          newPassword: newPassword,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast.success('密码修改成功！');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data?.message || '密码修改失败');
      }
    } catch (error: any) {
      console.error('修改密码失败:', error);
      toast.error(error.message || '密码修改失败');
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="default" className="bg-purple-600">超级管理员</Badge>;
      case 'admin':
        return <Badge variant="default" className="bg-blue-600">管理员</Badge>;
      case 'employee':
        return <Badge variant="secondary">员工</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">个人设置</h1>
        <p className="text-muted-foreground mt-2">
          管理您的个人信息和账号安全
        </p>
      </div>

      <div className="grid gap-6">
        {/* 个人信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              个人信息
            </CardTitle>
            <CardDescription>您的基本账号信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>用户名</Label>
                <div className="flex h-10 items-center px-3 rounded-md border border-input bg-muted">
                  {profile?.username || '-'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>角色</Label>
                <div className="flex h-10 items-center">
                  {profile?.role && getRoleBadge(profile.role)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>邮箱</Label>
                <div className="flex h-10 items-center px-3 rounded-md border border-input bg-muted">
                  {profile?.email || '-'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>手机号</Label>
                <div className="flex h-10 items-center px-3 rounded-md border border-input bg-muted">
                  {profile?.phone || '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 账号安全 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              账号安全
            </CardTitle>
            <CardDescription>修改您的登录密码</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old-password">当前密码 *</Label>
                <Input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="请输入当前密码"
                  disabled={changingPassword}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">新密码 *</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码（至少6位）"
                  disabled={changingPassword}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码 *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                  disabled={changingPassword}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  密码长度至少为6位，建议使用字母、数字和符号组合
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={changingPassword}>
                  {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  修改密码
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 安全提示 */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              安全提示
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• 定期修改密码可以提高账号安全性</p>
            <p>• 不要使用过于简单的密码，建议使用字母、数字和符号组合</p>
            <p>• 不要与他人分享您的密码</p>
            <p>• 如果发现账号异常，请立即修改密码并联系管理员</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
