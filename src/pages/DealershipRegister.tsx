import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { dealershipsApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/context/AuthContext';
import { Car, Building2, UserPlus, AlertCircle, Home, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function DealershipRegister() {
  const navigate = useNavigate();
  const { user, profile, dealership, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  // 如果用户已登录，显示提示
  const isLoggedIn = !!user;

  // 创建新车行的表单
  const [createForm, setCreateForm] = useState({
    // 车行信息
    dealershipName: '',
    dealershipCode: '',
    contactPerson: '',
    contactPhone: '',
    address: '',
    // 管理员账号信息
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // 加入现有车行的表单
  const [joinForm, setJoinForm] = useState({
    dealershipCode: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // 创建新车行并注册为管理员
  const handleCreateDealership = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    if (!createForm.dealershipName || !createForm.dealershipCode || !createForm.username || !createForm.password) {
      toast.error('请填写所有必填项');
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    if (createForm.password.length < 6) {
      toast.error('密码长度至少为6位');
      return;
    }

    // 验证手机号
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (createForm.phone && !phoneRegex.test(createForm.phone)) {
      toast.error('请输入有效的手机号码');
      return;
    }

    // 验证车行代码格式（只允许字母、数字、下划线）
    const codeRegex = /^[a-zA-Z0-9_]+$/;
    if (!codeRegex.test(createForm.dealershipCode)) {
      toast.error('车行代码只能包含字母、数字和下划线');
      return;
    }

    setLoading(true);
    try {
      // 1. 创建车行
      console.log('创建车行:', createForm.dealershipName);
      const dealership = await dealershipsApi.create({
        name: createForm.dealershipName,
        code: createForm.dealershipCode.toLowerCase(),
        contact_person: createForm.contactPerson,
        contact_phone: createForm.contactPhone,
        address: createForm.address,
        status: 'active',
      });
      console.log('车行创建成功:', dealership);

      // 2. 注册管理员账号
      console.log('注册管理员账号:', createForm.username);
      const email = `${createForm.username}@yichi.internal`;
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: createForm.password,
        options: {
          data: {
            username: createForm.username,
            phone: createForm.phone,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('注册失败：未返回用户信息');

      console.log('用户注册成功:', authData.user.id);

      // 3. 更新 profiles 表，设置为管理员并关联车行
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          dealership_id: dealership.id,
          phone: createForm.phone,
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('更新用户资料失败:', updateError);
        throw updateError;
      }

      console.log('用户资料更新成功');

      toast.success('车行创建成功！正在登录...');
      
      // 4. 自动登录
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: createForm.password,
      });

      if (signInError) {
        toast.error('自动登录失败，请手动登录');
        navigate('/login');
        return;
      }

      // 登录成功，跳转到仪表盘
      navigate('/');
    } catch (error: any) {
      console.error('创建车行失败:', error);
      if (error.message?.includes('duplicate key')) {
        toast.error('车行代码已被使用，请更换');
      } else if (error.message?.includes('User already registered')) {
        toast.error('用户名已被使用，请更换');
      } else {
        toast.error(error.message || '创建车行失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 加入现有车行
  const handleJoinDealership = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    if (!joinForm.dealershipCode || !joinForm.username || !joinForm.password) {
      toast.error('请填写所有必填项');
      return;
    }

    if (joinForm.password !== joinForm.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }

    if (joinForm.password.length < 6) {
      toast.error('密码长度至少为6位');
      return;
    }

    // 验证手机号
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (joinForm.phone && !phoneRegex.test(joinForm.phone)) {
      toast.error('请输入有效的手机号码');
      return;
    }

    setLoading(true);
    try {
      // 1. 查询车行是否存在
      console.log('查询车行:', joinForm.dealershipCode);
      const { data: dealerships, error: queryError } = await supabase
        .from('dealerships')
        .select('*')
        .eq('code', joinForm.dealershipCode.toLowerCase())
        .eq('status', 'active')
        .maybeSingle();

      if (queryError) throw queryError;
      if (!dealerships) {
        toast.error('车行代码不存在或已停用');
        return;
      }

      console.log('找到车行:', dealerships.name);

      // 2. 注册员工账号
      console.log('注册员工账号:', joinForm.username);
      const email = `${joinForm.username}@yichi.internal`;
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: joinForm.password,
        options: {
          data: {
            username: joinForm.username,
            phone: joinForm.phone,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('注册失败：未返回用户信息');

      console.log('用户注册成功:', authData.user.id);

      // 3. 更新 profiles 表，设置为员工并关联车行
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'employee',
          dealership_id: dealerships.id,
          phone: joinForm.phone,
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('更新用户资料失败:', updateError);
        throw updateError;
      }

      console.log('用户资料更新成功');

      toast.success(`成功加入${dealerships.name}！正在登录...`);
      
      // 4. 自动登录
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: joinForm.password,
      });

      if (signInError) {
        toast.error('自动登录失败，请手动登录');
        navigate('/login');
        return;
      }

      // 登录成功，跳转到仪表盘
      navigate('/');
    } catch (error: any) {
      console.error('加入车行失败:', error);
      if (error.message?.includes('User already registered')) {
        toast.error('用户名已被使用，请更换');
      } else {
        toast.error(error.message || '加入车行失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl sm:text-3xl">易驰汽车销售管理平台</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              创建新车行或加入现有车行开始使用
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* 已登录提示 */}
          {isLoggedIn && (
            <Alert className="mb-6 border-primary/50 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="flex flex-col gap-3">
                <div>
                  <p className="font-medium">您已登录</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    当前账号：{profile?.username} | 车行：{dealership?.name || '未知'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="gap-2"
                  >
                    <Home className="h-4 w-4" />
                    返回首页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await signOut();
                        toast.success('已退出登录');
                        window.location.reload();
                      } catch (error) {
                        console.error('退出登录失败:', error);
                        toast.error('退出登录失败');
                      }
                    }}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    退出登录后注册新车行
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!isLoggedIn && (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'join')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create" className="gap-2">
                  <Car className="h-4 w-4" />
                  创建新车行
                </TabsTrigger>
                <TabsTrigger value="join" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  加入车行
                </TabsTrigger>
              </TabsList>

            {/* 创建新车行 */}
            <TabsContent value="create">
              <form onSubmit={handleCreateDealership} className="space-y-4">
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-sm text-muted-foreground">车行信息</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dealershipName" className="text-sm sm:text-base">
                      车行名称 *
                    </Label>
                    <Input
                      id="dealershipName"
                      placeholder="例如：易驰汽车"
                      value={createForm.dealershipName}
                      onChange={(e) => setCreateForm({ ...createForm, dealershipName: e.target.value })}
                      disabled={loading}
                      className="h-11 sm:h-10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dealershipCode" className="text-sm sm:text-base">
                      车行代码 *
                    </Label>
                    <Input
                      id="dealershipCode"
                      placeholder="例如：yichi（用于员工加入，只能包含字母、数字、下划线）"
                      value={createForm.dealershipCode}
                      onChange={(e) => setCreateForm({ ...createForm, dealershipCode: e.target.value })}
                      disabled={loading}
                      className="h-11 sm:h-10"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      车行代码将用于员工加入车行，请妥善保管
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson" className="text-sm sm:text-base">
                        联系人
                      </Label>
                      <Input
                        id="contactPerson"
                        placeholder="联系人姓名"
                        value={createForm.contactPerson}
                        onChange={(e) => setCreateForm({ ...createForm, contactPerson: e.target.value })}
                        disabled={loading}
                        className="h-11 sm:h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="text-sm sm:text-base">
                        联系电话
                      </Label>
                      <Input
                        id="contactPhone"
                        placeholder="联系电话"
                        value={createForm.contactPhone}
                        onChange={(e) => setCreateForm({ ...createForm, contactPhone: e.target.value })}
                        disabled={loading}
                        className="h-11 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm sm:text-base">
                      车行地址
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="车行详细地址"
                      value={createForm.address}
                      onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                      disabled={loading}
                      className="min-h-20"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-sm text-muted-foreground">管理员账号</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="create-username" className="text-sm sm:text-base">
                      用户名 *
                    </Label>
                    <Input
                      id="create-username"
                      placeholder="请输入用户名"
                      value={createForm.username}
                      onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                      disabled={loading}
                      className="h-11 sm:h-10"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-password" className="text-sm sm:text-base">
                        密码 *
                      </Label>
                      <Input
                        id="create-password"
                        type="password"
                        placeholder="至少6位"
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        disabled={loading}
                        className="h-11 sm:h-10"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-confirmPassword" className="text-sm sm:text-base">
                        确认密码 *
                      </Label>
                      <Input
                        id="create-confirmPassword"
                        type="password"
                        placeholder="再次输入密码"
                        value={createForm.confirmPassword}
                        onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                        disabled={loading}
                        className="h-11 sm:h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-phone" className="text-sm sm:text-base">
                      手机号
                    </Label>
                    <Input
                      id="create-phone"
                      type="tel"
                      placeholder="用于联系和身份验证"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      disabled={loading}
                      className="h-11 sm:h-10"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    disabled={loading}
                    className="h-11 sm:h-10 w-full sm:w-auto"
                  >
                    返回登录
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 sm:h-10 w-full sm:flex-1"
                  >
                    {loading ? '创建中...' : '创建车行并注册'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* 加入现有车行 */}
            <TabsContent value="join">
              <form onSubmit={handleJoinDealership} className="space-y-4">
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-sm text-muted-foreground">车行信息</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="join-dealershipCode" className="text-sm sm:text-base">
                      车行代码 *
                    </Label>
                    <Input
                      id="join-dealershipCode"
                      placeholder="请输入车行代码"
                      value={joinForm.dealershipCode}
                      onChange={(e) => setJoinForm({ ...joinForm, dealershipCode: e.target.value })}
                      disabled={loading}
                      className="h-11 sm:h-10"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      请向车行管理员获取车行代码
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-sm text-muted-foreground">员工账号</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="join-username" className="text-sm sm:text-base">
                      用户名 *
                    </Label>
                    <Input
                      id="join-username"
                      placeholder="请输入用户名"
                      value={joinForm.username}
                      onChange={(e) => setJoinForm({ ...joinForm, username: e.target.value })}
                      disabled={loading}
                      className="h-11 sm:h-10"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="join-password" className="text-sm sm:text-base">
                        密码 *
                      </Label>
                      <Input
                        id="join-password"
                        type="password"
                        placeholder="至少6位"
                        value={joinForm.password}
                        onChange={(e) => setJoinForm({ ...joinForm, password: e.target.value })}
                        disabled={loading}
                        className="h-11 sm:h-10"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="join-confirmPassword" className="text-sm sm:text-base">
                        确认密码 *
                      </Label>
                      <Input
                        id="join-confirmPassword"
                        type="password"
                        placeholder="再次输入密码"
                        value={joinForm.confirmPassword}
                        onChange={(e) => setJoinForm({ ...joinForm, confirmPassword: e.target.value })}
                        disabled={loading}
                        className="h-11 sm:h-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="join-phone" className="text-sm sm:text-base">
                      手机号
                    </Label>
                    <Input
                      id="join-phone"
                      type="tel"
                      placeholder="用于联系和身份验证"
                      value={joinForm.phone}
                      onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                      disabled={loading}
                      className="h-11 sm:h-10"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/login')}
                    disabled={loading}
                    className="h-11 sm:h-10 w-full sm:w-auto"
                  >
                    返回登录
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 sm:h-10 w-full sm:flex-1"
                  >
                    {loading ? '加入中...' : '加入车行并注册'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
