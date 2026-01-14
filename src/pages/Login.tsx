import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Car, KeyRound } from 'lucide-react';
import { supabase } from '@/db/supabase';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 管理员密码重置
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetUsername, setResetUsername] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      await signIn(username, password);
      toast.success('登录成功');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('登录失败:', error);
      toast.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !phone) {
      toast.error('请输入用户名、密码和手机号码');
      return;
    }

    if (password.length < 6) {
      toast.error('密码长度至少为6位');
      return;
    }

    // 验证手机号码格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('请输入正确的手机号码');
      return;
    }

    setLoading(true);
    try {
      await signUp(username, password, phone);
      toast.success('注册成功，正在登录...');
      // 注册成功后自动登录
      await signIn(username, password);
      navigate(from, { replace: true });
    } catch (error: unknown) {
      console.error('注册失败:', error);
      const errorMessage = error instanceof Error ? error.message : '注册失败';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetUsername || !resetNewPassword) {
      toast.error('请输入用户名和新密码');
      return;
    }

    if (resetNewPassword.length < 6) {
      toast.error('新密码长度至少为6位');
      return;
    }

    setResetLoading(true);
    try {
      // 调用 Edge Function 重置管理员密码
      const { data, error } = await supabase.functions.invoke('reset-admin-password', {
        body: {
          username: resetUsername,
          newPassword: resetNewPassword,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast.success('管理员密码重置成功！请使用新密码登录');
        setResetDialogOpen(false);
        setResetUsername('');
        setResetNewPassword('');
      } else {
        toast.error(data?.message || '密码重置失败');
      }
    } catch (error: any) {
      console.error('重置密码失败:', error);
      toast.error(error.message || '密码重置失败');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Car className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">二手车销售管理系统</CardTitle>
            <CardDescription className="mt-2">
              专业的车行管理解决方案
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">登录</TabsTrigger>
              <TabsTrigger value="signup">注册</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-username">用户名</Label>
                  <Input
                    id="signin-username"
                    type="text"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">密码</Label>
                    <span className="text-xs text-muted-foreground">
                      忘记密码？请联系管理员重置
                    </span>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '登录中...' : '登录'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">用户名</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="请输入用户名（支持中文）"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    用户名可以使用中文、字母、数字等任意字符
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">密码</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="至少6位"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">手机号码</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="请输入手机号码"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    用于联系和身份验证
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '注册中...' : '注册'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 底部按钮组 */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary"
          onClick={() => navigate('/register')}
        >
          <Car className="h-4 w-4 mr-2" />
          浏览在售车辆
        </Button>
        
        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
            >
              <KeyRound className="h-4 w-4 mr-2" />
              管理员密码重置
            </Button>
          </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>管理员密码重置</DialogTitle>
            <DialogDescription>
              只有管理员账号可以使用此功能重置密码
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-username" className="text-sm sm:text-base">
                管理员用户名 *
              </Label>
              <Input
                id="reset-username"
                type="text"
                placeholder="请输入管理员用户名"
                value={resetUsername}
                onChange={(e) => setResetUsername(e.target.value)}
                disabled={resetLoading}
                className="h-11 sm:h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-password" className="text-sm sm:text-base">
                新密码 *
              </Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="请输入新密码（至少6位）"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                disabled={resetLoading}
                className="h-11 sm:h-10"
                required
              />
              <p className="text-xs text-muted-foreground">
                密码长度至少为6位，建议使用字母、数字和符号组合
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetDialogOpen(false)}
                disabled={resetLoading}
                className="h-11 sm:h-10 w-full sm:w-auto"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={resetLoading}
                className="h-11 sm:h-10 w-full sm:w-auto"
              >
                {resetLoading ? '重置中...' : '重置密码'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
