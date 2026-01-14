import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  Calendar,
  Gauge,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Users,
  TrendingUp,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import type { Vehicle, Dealership } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadBusinessLicense, formatFileSize } from '@/utils/imageUpload';
import { PROVINCES, getCitiesByProvince } from '@/utils/regions';
import DisclaimerContent from '@/components/DisclaimerContent';

export default function PublicHomeNew() {
  const navigate = useNavigate();
  const { user, profile, dealership } = useAuth();
  const [loading, setLoading] = useState(true);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState(1); // 注册步骤：1-基本信息，2-资质上传，3-确认提交
  
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 获取所有激活的车行
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
        .order('created_at', { ascending: false })
        .limit(12); // 只显示最新的12辆车

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

  // 验证步骤1
  const validateStep1 = () => {
    if (!createForm.dealershipName) {
      toast.error('请填写车行名称');
      return false;
    }
    if (!createForm.dealershipCode) {
      toast.error('请填写车行代码');
      return false;
    }
    const codeRegex = /^[a-zA-Z0-9_]+$/;
    if (!codeRegex.test(createForm.dealershipCode)) {
      toast.error('车行代码只能包含字母、数字和下划线');
      return false;
    }
    if (!createForm.contactPhone) {
      toast.error('请填写车行联系电话');
      return false;
    }
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(createForm.contactPhone)) {
      toast.error('请输入正确的手机号');
      return false;
    }
    if (!createForm.province || !createForm.city) {
      toast.error('请选择所在地区');
      return false;
    }
    return true;
  };

  // 验证步骤2
  const validateStep2 = () => {
    if (!createForm.businessLicense) {
      toast.error('请上传营业执照');
      return false;
    }
    if (!createForm.username) {
      toast.error('请填写管理员用户名');
      return false;
    }
    if (!createForm.phone) {
      toast.error('请填写管理员手机号');
      return false;
    }
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(createForm.phone)) {
      toast.error('请输入正确的管理员手机号');
      return false;
    }
    if (!createForm.password) {
      toast.error('请设置密码');
      return false;
    }
    if (createForm.password.length < 6) {
      toast.error('密码长度至少为6位');
      return false;
    }
    if (createForm.password !== createForm.confirmPassword) {
      toast.error('两次输入的密码不一致');
      return false;
    }
    return true;
  };

  // 下一步
  const handleNextStep = () => {
    if (registerStep === 1 && validateStep1()) {
      setRegisterStep(2);
    } else if (registerStep === 2 && validateStep2()) {
      setRegisterStep(3);
    }
  };

  // 上一步
  const handlePrevStep = () => {
    if (registerStep > 1) {
      setRegisterStep(registerStep - 1);
    }
  };

  // 提交注册
  const handleSubmitRegistration = async () => {
    if (!createForm.agreeDisclaimer) {
      toast.error('请阅读并同意服务协议及免责条款');
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
        status: 'pending',
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
      setRegisterStep(1);
      
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

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold">易驰汽车</span>
              <p className="text-xs text-muted-foreground">二手车经营管理平台</p>
            </div>
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
                <Button variant="ghost" onClick={() => navigate('/login')} className="gap-2">
                  <LogIn className="h-4 w-4" />
                  登录
                </Button>
                <Dialog open={registerDialogOpen} onOpenChange={(open) => {
                  setRegisterDialogOpen(open);
                  if (!open) setRegisterStep(1);
                }}>
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
                        填写以下信息完成注册，审核通过后即可使用平台服务
                      </DialogDescription>
                    </DialogHeader>
                    
                    {/* 步骤指示器 */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${registerStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          {registerStep > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
                        </div>
                        <span className="text-sm font-medium">基本信息</span>
                      </div>
                      <Separator className="flex-1 mx-2" />
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${registerStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          {registerStep > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
                        </div>
                        <span className="text-sm font-medium">资质上传</span>
                      </div>
                      <Separator className="flex-1 mx-2" />
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${registerStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          3
                        </div>
                        <span className="text-sm font-medium">确认提交</span>
                      </div>
                    </div>

                    {/* 步骤1：基本信息 */}
                    {registerStep === 1 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="dealershipName">车行名称 *</Label>
                            <Input
                              id="dealershipName"
                              placeholder="例如：易驰汽车"
                              value={createForm.dealershipName}
                              onChange={(e) => setCreateForm({ ...createForm, dealershipName: e.target.value })}
                              disabled={registerLoading}
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
                            />
                            <p className="text-xs text-muted-foreground">只能包含字母、数字和下划线</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contactPerson">联系人</Label>
                            <Input
                              id="contactPerson"
                              placeholder="请输入联系人姓名"
                              value={createForm.contactPerson}
                              onChange={(e) => setCreateForm({ ...createForm, contactPerson: e.target.value })}
                              disabled={registerLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactPhone">联系电话 *</Label>
                            <Input
                              id="contactPhone"
                              type="tel"
                              placeholder="请输入手机号"
                              value={createForm.contactPhone}
                              onChange={(e) => setCreateForm({ ...createForm, contactPhone: e.target.value })}
                              disabled={registerLoading}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="province">省份 *</Label>
                            <Select
                              value={createForm.province}
                              onValueChange={(value) => setCreateForm({ ...createForm, province: value, city: '', district: '' })}
                              disabled={registerLoading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="选择省份" />
                              </SelectTrigger>
                              <SelectContent>
                                {PROVINCES.map((province) => (
                                  <SelectItem key={province} value={province}>
                                    {province}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">城市 *</Label>
                            <Select
                              value={createForm.city}
                              onValueChange={(value) => setCreateForm({ ...createForm, city: value, district: '' })}
                              disabled={registerLoading || !createForm.province}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="选择城市" />
                              </SelectTrigger>
                              <SelectContent>
                                {getCitiesByProvince(createForm.province).map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="district">区县</Label>
                            <Input
                              id="district"
                              placeholder="选填"
                              value={createForm.district}
                              onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                              disabled={registerLoading}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">详细地址</Label>
                          <Input
                            id="address"
                            placeholder="请输入详细地址"
                            value={createForm.address}
                            onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                            disabled={registerLoading}
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button onClick={handleNextStep} className="gap-2">
                            下一步
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 步骤2：资质上传 */}
                    {registerStep === 2 && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>营业执照 *</Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            {createForm.businessLicense ? (
                              <div className="space-y-3">
                                <img
                                  src={createForm.businessLicense}
                                  alt="营业执照"
                                  className="max-h-48 mx-auto rounded-lg"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setCreateForm({ ...createForm, businessLicense: '', businessLicensePath: '' })}
                                >
                                  重新上传
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                                <div>
                                  <Label htmlFor="businessLicense" className="cursor-pointer">
                                    <span className="text-primary hover:underline">点击上传</span>
                                    <span className="text-muted-foreground"> 或拖拽文件到此处</span>
                                  </Label>
                                  <Input
                                    id="businessLicense"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleBusinessLicenseUpload}
                                    disabled={uploading || registerLoading}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  支持 JPG、PNG、WEBP 格式，文件大小不超过 1MB
                                </p>
                                {uploading && (
                                  <div className="space-y-2">
                                    <Progress value={uploadProgress} />
                                    <p className="text-xs text-muted-foreground">上传中... {uploadProgress}%</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">管理员用户名 *</Label>
                            <Input
                              id="username"
                              placeholder="请输入用户名"
                              value={createForm.username}
                              onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                              disabled={registerLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">管理员手机号 *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="请输入手机号"
                              value={createForm.phone}
                              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                              disabled={registerLoading}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="password">登录密码 *</Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder="至少6位"
                              value={createForm.password}
                              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                              disabled={registerLoading}
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
                            />
                          </div>
                        </div>

                        <div className="flex justify-between gap-2 pt-4">
                          <Button variant="outline" onClick={handlePrevStep}>
                            上一步
                          </Button>
                          <Button onClick={handleNextStep} className="gap-2">
                            下一步
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 步骤3：确认提交 */}
                    {registerStep === 3 && (
                      <div className="space-y-4">
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            请仔细阅读以下服务协议及免责条款，确认无误后提交注册申请
                          </AlertDescription>
                        </Alert>

                        <DisclaimerContent />

                        <div className="flex items-start space-x-2 pt-4">
                          <Checkbox
                            id="agreeDisclaimer"
                            checked={createForm.agreeDisclaimer}
                            onCheckedChange={(checked) => setCreateForm({ ...createForm, agreeDisclaimer: checked as boolean })}
                            disabled={registerLoading}
                          />
                          <Label htmlFor="agreeDisclaimer" className="text-sm leading-relaxed cursor-pointer">
                            我已阅读并同意《易驰汽车平台服务协议及免责条款》
                          </Label>
                        </div>

                        <div className="flex justify-between gap-2 pt-4">
                          <Button variant="outline" onClick={handlePrevStep} disabled={registerLoading}>
                            上一步
                          </Button>
                          <Button onClick={handleSubmitRegistration} disabled={registerLoading || !createForm.agreeDisclaimer}>
                            {registerLoading ? '提交中...' : '提交注册申请'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              专业二手车经营管理平台
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              优质二手车
              <span className="block text-primary mt-2">一站式经营管理平台</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              汇聚多家优质车行，精选在售车辆，为您提供安全、便捷、透明的二手车经营管理服务
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Dialog open={registerDialogOpen} onOpenChange={(open) => {
                setRegisterDialogOpen(open);
                if (!open) setRegisterStep(1);
              }}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2 text-lg h-12">
                    <Building2 className="h-5 w-5" />
                    立即注册车行
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button size="lg" variant="outline" className="gap-2 text-lg h-12" onClick={() => {
                document.getElementById('vehicles-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <Car className="h-5 w-5" />
                浏览在售车辆
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 注册流程说明 */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">如何注册使用</h2>
            <p className="text-muted-foreground">简单三步，快速开启车行管理</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 mx-auto">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">提交资料</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  填写车行信息，上传营业执照
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 mx-auto">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">等待审核</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  平台审核资质，1-2个工作日
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">开始使用</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  审核通过后即可登录管理系统
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 平台特色 */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">平台优势</h2>
            <p className="text-muted-foreground">为车行提供全方位的线上展示和管理服务</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">安全可靠</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  严格审核机制，确保每家车行资质真实有效
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">操作简单</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  直观的管理界面，快速上手，轻松管理车辆信息
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">客户触达</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  统一展示平台，帮助您触达更多潜在客户
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">数据分析</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  完善的统计分析功能，助力业务增长
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 车辆展示区 */}
      <section id="vehicles-section" className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">精选车辆</h2>
              <p className="text-muted-foreground">来自优质车行的最新在售车辆</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索品牌、型号..."
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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  {vehicle.photos && vehicle.photos.length > 0 && (
                    <div className="relative h-48 bg-muted overflow-hidden">
                      <img
                        src={vehicle.photos[0]}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <Badge className="absolute top-2 right-2 bg-primary">
                        在售
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">
                      {vehicle.brand} {vehicle.model}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {vehicle.year}年
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        {vehicle.mileage?.toLocaleString()}公里
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                      <span className="line-clamp-1">
                        {vehicle.dealership?.name || '未知车行'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 底部 CTA */}
      {!user && (
        <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">准备好开始了吗？</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              加入易驰汽车平台，让更多客户看到您的优质车源
            </p>
            <Dialog open={registerDialogOpen} onOpenChange={(open) => {
              setRegisterDialogOpen(open);
              if (!open) setRegisterStep(1);
            }}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 text-lg h-12">
                  <Building2 className="h-5 w-5" />
                  立即注册车行
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </section>
      )}

      {/* 页脚 */}
      <footer className="border-t bg-muted/30">
        <div className="container px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xl font-bold">易驰汽车</span>
              </div>
              <p className="text-sm text-muted-foreground">
                专业的二手车经营管理平台，为车行提供安全、便捷的管理服务。
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">联系我们</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>400-888-8888</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>service@yichi.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>中国·北京</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">快速链接</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="hover:text-primary cursor-pointer transition-colors">关于我们</div>
                <div className="hover:text-primary cursor-pointer transition-colors">服务协议</div>
                <div className="hover:text-primary cursor-pointer transition-colors">隐私政策</div>
                <div className="hover:text-primary cursor-pointer transition-colors">帮助中心</div>
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2026 易驰汽车平台 · 优质二手车经营管理平台</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
