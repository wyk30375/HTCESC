import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { dealershipsApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  Car, 
  Building2, 
  UserPlus, 
  Search, 
  LogIn, 
  Home as HomeIcon,
  Filter,
  MapPin,
  Phone,
  Calendar,
  Gauge,
  Upload,
  FileText,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import type { Vehicle, Dealership } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadBusinessLicense, formatFileSize } from '@/utils/imageUpload';
import { PROVINCES, getCitiesByProvince } from '@/utils/regions';
import DisclaimerContent from '@/components/DisclaimerContent';

export default function PublicHome() {
  const navigate = useNavigate();
  const { user, profile, dealership } = useAuth();
  const [loading, setLoading] = useState(true);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  
  // 上传进度
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  // 车辆和车行数据
  const [vehicles, setVehicles] = useState<(Vehicle & { dealership?: Dealership })[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [selectedDealership, setSelectedDealership] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 注册表单
  const [createForm, setCreateForm] = useState({
    dealershipName: '',
    dealershipCode: '',
    contactPerson: '',
    contactPhone: '', // 必填
    address: '',
    businessLicense: '', // 营业执照URL
    businessLicensePath: '', // 营业执照路径（用于删除）
    province: '', // 必填
    city: '', // 必填
    district: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '', // 管理员手机号，必填
    agreeDisclaimer: false, // 必填
  });

  const [joinForm, setJoinForm] = useState({
    dealershipCode: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 获取所有车行
      const { data: dealershipsData, error: dealershipsError } = await supabase
        .from('dealerships')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (dealershipsError) throw dealershipsError;
      setDealerships(dealershipsData || []);

      // 获取所有在售车辆
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select(`
          *,
          dealership:dealerships(*)
        `)
        .eq('status', 'in_stock')
        .order('created_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 筛选车辆
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesDealership = selectedDealership === 'all' || vehicle.dealership_id === selectedDealership;
    const matchesSearch = searchQuery === '' || 
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.plate_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDealership && matchesSearch;
  });

  // 按车行分组
  const vehiclesByDealership = filteredVehicles.reduce((acc, vehicle) => {
    const dealershipId = vehicle.dealership_id || 'unknown';
    if (!acc[dealershipId]) {
      acc[dealershipId] = [];
    }
    acc[dealershipId].push(vehicle);
    return acc;
  }, {} as Record<string, typeof filteredVehicles>);

  // 处理营业执照上传
  const handleBusinessLicenseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const result = await uploadBusinessLicense(file, (progress) => {
        setUploadProgress(progress);
      });

      setCreateForm({
        ...createForm,
        businessLicense: result.url,
        businessLicensePath: result.path,
      });

      if (result.compressed) {
        toast.success(`营业执照上传成功！图片已自动压缩至 ${formatFileSize(result.finalSize)}`);
      } else {
        toast.success('营业执照上传成功！');
      }
    } catch (error: any) {
      console.error('上传失败:', error);
      toast.error(error.message || '上传失败，请重试');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 创建新车行
  const handleCreateDealership = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证必填项
    if (!createForm.dealershipName || !createForm.dealershipCode || !createForm.username || !createForm.password) {
      toast.error('请填写所有必填项');
      return;
    }

    if (!createForm.contactPhone) {
      toast.error('请填写车行联系电话');
      return;
    }

    if (!createForm.phone) {
      toast.error('请填写管理员手机号');
      return;
    }

    if (!createForm.businessLicense) {
      toast.error('请上传营业执照');
      return;
    }

    if (!createForm.province || !createForm.city) {
      toast.error('请选择所在地区');
      return;
    }

    if (!createForm.agreeDisclaimer) {
      toast.error('请阅读并同意服务协议及免责条款');
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

    const codeRegex = /^[a-zA-Z0-9_]+$/;
    if (!codeRegex.test(createForm.dealershipCode)) {
      toast.error('车行代码只能包含字母、数字和下划线');
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(createForm.contactPhone)) {
      toast.error('请输入正确的车行联系电话');
      return;
    }

    if (!phoneRegex.test(createForm.phone)) {
      toast.error('请输入正确的管理员手机号');
      return;
    }

    setRegisterLoading(true);
    try {
      // 创建车行（状态为 pending）
      const dealershipData = await dealershipsApi.create({
        name: createForm.dealershipName,
        code: createForm.dealershipCode.toLowerCase(),
        contact_person: createForm.contactPerson,
        contact_phone: createForm.contactPhone,
        address: createForm.address,
        business_license: createForm.businessLicense,
        province: createForm.province,
        city: createForm.city,
        district: createForm.district,
        status: 'pending', // 待审核状态
      });

      // 创建管理员账号
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

      // 更新用户资料
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          dealership_id: dealershipData.id,
          phone: createForm.phone,
        })
        .eq('id', authData.user.id);

      if (updateError) throw updateError;

      toast.success('注册申请已提交！请等待管理员审核', { duration: 5000 });
      setRegisterDialogOpen(false);
      
      // 显示审核提示
      toast.info('审核通过后，您将收到通知并可以登录使用系统', { duration: 5000 });
      
      // 重置表单
      setCreateForm({
        dealershipName: '',
        dealershipCode: '',
        contactPerson: '',
        contactPhone: '',
        address: '',
        businessLicense: '',
        businessLicensePath: '',
        province: '',
        city: '',
        district: '',
        username: '',
        password: '',
        confirmPassword: '',
        phone: '',
        agreeDisclaimer: false,
      });
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
      setRegisterLoading(false);
    }
  };

  // 加入现有车行
  const handleJoinDealership = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    setRegisterLoading(true);
    try {
      const { data: dealershipsData, error: queryError } = await supabase
        .from('dealerships')
        .select('*')
        .eq('code', joinForm.dealershipCode.toLowerCase())
        .eq('status', 'active')
        .maybeSingle();

      if (queryError) throw queryError;
      if (!dealershipsData) {
        toast.error('车行代码不存在或已停用');
        return;
      }

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

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'employee',
          dealership_id: dealershipsData.id,
          phone: joinForm.phone,
        })
        .eq('id', authData.user.id);

      if (updateError) throw updateError;

      toast.success(`成功加入${dealershipsData.name}！正在登录...`);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: joinForm.password,
      });

      if (signInError) {
        toast.error('自动登录失败，请手动登录');
        navigate('/login');
        return;
      }

      navigate('/');
    } catch (error: any) {
      console.error('加入车行失败:', error);
      if (error.message?.includes('User already registered')) {
        toast.error('用户名已被使用，请更换');
      } else {
        toast.error(error.message || '加入车行失败');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">易驰汽车平台</span>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Badge variant="outline" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  {dealership?.name || '未知车行'}
                </Badge>
                <Button onClick={() => navigate('/')} className="gap-2">
                  <HomeIcon className="h-4 w-4" />
                  进入系统
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/login')} className="gap-2">
                  <LogIn className="h-4 w-4" />
                  登录
                </Button>
                <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      注册车行
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>车行注册</DialogTitle>
                      <DialogDescription>
                        创建新车行或加入现有车行开始使用平台
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'join')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="create" className="gap-2">
                          <Building2 className="h-4 w-4" />
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
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="dealershipName">车行名称 *</Label>
                                <Input
                                  id="dealershipName"
                                  placeholder="例如：易驰汽车"
                                  value={createForm.dealershipName}
                                  onChange={(e) => setCreateForm({ ...createForm, dealershipName: e.target.value })}
                                  disabled={registerLoading}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="dealershipCode">车行代码 *</Label>
                                <Input
                                  id="dealershipCode"
                                  placeholder="例如：yichi"
                                  value={createForm.dealershipCode}
                                  onChange={(e) => setCreateForm({ ...createForm, dealershipCode: e.target.value })}
                                  disabled={registerLoading}
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="username">管理员用户名 *</Label>
                                <Input
                                  id="username"
                                  placeholder="请输入用户名"
                                  value={createForm.username}
                                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                                  disabled={registerLoading}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="phone">手机号</Label>
                                <Input
                                  id="phone"
                                  type="tel"
                                  placeholder="联系电话"
                                  value={createForm.phone}
                                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                  disabled={registerLoading}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="password">密码 *</Label>
                                <Input
                                  id="password"
                                  type="password"
                                  placeholder="至少6位"
                                  value={createForm.password}
                                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                  disabled={registerLoading}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="confirmPassword">确认密码 *</Label>
                                <Input
                                  id="confirmPassword"
                                  type="password"
                                  placeholder="再次输入密码"
                                  value={createForm.confirmPassword}
                                  onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                                  disabled={registerLoading}
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setRegisterDialogOpen(false)}
                              disabled={registerLoading}
                            >
                              取消
                            </Button>
                            <Button type="submit" disabled={registerLoading}>
                              {registerLoading ? '创建中...' : '创建车行'}
                            </Button>
                          </div>
                        </form>
                      </TabsContent>

                      {/* 加入现有车行 */}
                      <TabsContent value="join">
                        <form onSubmit={handleJoinDealership} className="space-y-4">
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="join-dealershipCode">车行代码 *</Label>
                              <Input
                                id="join-dealershipCode"
                                placeholder="请输入车行代码"
                                value={joinForm.dealershipCode}
                                onChange={(e) => setJoinForm({ ...joinForm, dealershipCode: e.target.value })}
                                disabled={registerLoading}
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="join-username">用户名 *</Label>
                                <Input
                                  id="join-username"
                                  placeholder="请输入用户名"
                                  value={joinForm.username}
                                  onChange={(e) => setJoinForm({ ...joinForm, username: e.target.value })}
                                  disabled={registerLoading}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="join-phone">手机号</Label>
                                <Input
                                  id="join-phone"
                                  type="tel"
                                  placeholder="联系电话"
                                  value={joinForm.phone}
                                  onChange={(e) => setJoinForm({ ...joinForm, phone: e.target.value })}
                                  disabled={registerLoading}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="join-password">密码 *</Label>
                                <Input
                                  id="join-password"
                                  type="password"
                                  placeholder="至少6位"
                                  value={joinForm.password}
                                  onChange={(e) => setJoinForm({ ...joinForm, password: e.target.value })}
                                  disabled={registerLoading}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="join-confirmPassword">确认密码 *</Label>
                                <Input
                                  id="join-confirmPassword"
                                  type="password"
                                  placeholder="再次输入密码"
                                  value={joinForm.confirmPassword}
                                  onChange={(e) => setJoinForm({ ...joinForm, confirmPassword: e.target.value })}
                                  disabled={registerLoading}
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setRegisterDialogOpen(false)}
                              disabled={registerLoading}
                            >
                              取消
                            </Button>
                            <Button type="submit" disabled={registerLoading}>
                              {registerLoading ? '加入中...' : '加入车行'}
                            </Button>
                          </div>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="container px-4 py-12 md:py-20">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            优质二手车 <span className="text-primary">一站式平台</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            汇聚多家优质车行，精选在售车辆，为您提供最佳购车体验
          </p>
          
          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto pt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索品牌、型号、车牌号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDealership} onValueChange={setSelectedDealership}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="选择车行" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部车行</SelectItem>
                {dealerships.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* 车辆展示区 */}
      <section className="container px-4 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-20">
            <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">暂无车辆</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedDealership !== 'all' 
                ? '没有找到符合条件的车辆' 
                : '平台暂无在售车辆'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(vehiclesByDealership).map(([dealershipId, dealershipVehicles]) => {
              const dealershipInfo = dealerships.find(d => d.id === dealershipId);
              if (!dealershipInfo) return null;

              return (
                <div key={dealershipId} className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">{dealershipInfo.name}</h2>
                    <Badge variant="secondary">{dealershipVehicles.length} 辆在售</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dealershipVehicles.map((vehicle) => (
                      <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        {vehicle.photos && vehicle.photos.length > 0 && (
                          <div className="relative h-48 bg-muted">
                            <img
                              src={vehicle.photos[0]}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <Badge className="absolute top-2 right-2">
                              在售
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl">
                            {vehicle.brand} {vehicle.model}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {vehicle.year}年
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Gauge className="h-3 w-3" />
                              {vehicle.mileage?.toLocaleString()}公里
                            </span>
                            {vehicle.plate_number && (
                              <Badge variant="outline">{vehicle.plate_number}</Badge>
                            )}
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            ¥{vehicle.purchase_price?.toLocaleString()}
                          </div>
                          {vehicle.condition_description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {vehicle.condition_description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                            <Building2 className="h-3 w-3" />
                            {dealershipInfo.name}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 底部 CTA */}
      {!user && (
        <section className="border-t bg-muted/50">
          <div className="container px-4 py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">加入易驰汽车平台</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              注册您的车行，开始在线展示和管理车辆，触达更多潜在客户
            </p>
            <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Building2 className="h-5 w-5" />
                  立即注册车行
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </section>
      )}

      {/* 页脚 */}
      <footer className="border-t">
        <div className="container px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2026 易驰汽车平台 · 优质二手车交易平台</p>
        </div>
      </footer>
    </div>
  );
}
