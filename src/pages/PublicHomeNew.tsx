import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useAuth } from '@/context/AuthContext';
import { 
  Car, 
  Building2, 
  Search, 
  LogIn, 
  Home as HomeIcon,
  Filter,
  Calendar,
  Gauge,
  Shield,
  Zap,
  Users,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  QrCode,
  Copy,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  ChevronsUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import type { Vehicle, Dealership } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/db/supabase';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import {
  VEHICLE_TYPE_MAP,
  TRANSMISSION_TYPE_MAP,
  DRIVE_TYPE_MAP,
  FUEL_TYPE_MAP,
  EMISSION_STANDARD_MAP
} from '@/types/vehicleEnums';

export default function PublicHomeNew() {
  const navigate = useNavigate();
  const { user, profile, dealership } = useAuth();
  const [loading, setLoading] = useState(true);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [vehicleDetailOpen, setVehicleDetailOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<(Vehicle & { dealership?: Dealership }) | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  
  // 车辆和车行数据
  const [vehicles, setVehicles] = useState<(Vehicle & { dealership?: Dealership })[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 注册表单数据
  const [registerForm, setRegisterForm] = useState({
    name: '',
    code: '',
    contact_person: '',
    contact_phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // 提取地级市列表（去重）
      const cityList = Array.from(new Set(
        (dealershipsData || [])
          .map(d => d.city)
          .filter(city => city && city.trim() !== '')
      )).sort();
      setCities(cityList);

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
    } finally {
      setLoading(false);
    }
  };

  // 处理车行注册
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    if (!registerForm.name || !registerForm.code || !registerForm.contact_person || !registerForm.contact_phone) {
      toast.error('请填写所有必填项');
      return;
    }

    // 验证车行代码格式
    const codeRegex = /^[a-zA-Z0-9_]+$/;
    if (!codeRegex.test(registerForm.code)) {
      toast.error('车行代码只能包含字母、数字和下划线');
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(registerForm.contact_phone)) {
      toast.error('请输入正确的手机号码');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 提交车行注册申请
      const { error } = await supabase
        .from('dealerships')
        .insert([{
          name: registerForm.name,
          code: registerForm.code,
          contact_person: registerForm.contact_person,
          contact_phone: registerForm.contact_phone,
          address: registerForm.address || null,
          status: 'pending' // 待审核状态
        }]);

      if (error) {
        if (error.message?.includes('duplicate key')) {
          toast.error('车行代码已存在，请更换');
        } else {
          throw error;
        }
        return;
      }

      toast.success('注册申请已提交，请等待平台审核');
      setRegisterDialogOpen(false);
      setRegisterForm({
        name: '',
        code: '',
        contact_person: '',
        contact_phone: '',
        address: ''
      });
    } catch (error: any) {
      console.error('注册失败:', error);
      toast.error(error.message || '注册失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 筛选车辆
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesCity = selectedCity === 'all' || vehicle.dealership?.city === selectedCity;
    const matchesSearch = searchQuery === '' || 
      vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.plate_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 py-3">
          {/* 第一行：品牌logo */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="text-xl font-bold">恏淘车</span>
                <p className="text-xs text-muted-foreground">二手车经营管理平台</p>
              </div>
            </div>
            
            {!user && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setQrDialogOpen(true)} 
                className="gap-2"
              >
                <QrCode className="h-4 w-4" />
                平台分享
              </Button>
            )}
          </div>
          
          {/* 第二行：登录按钮 */}
          <div className="flex items-center justify-between gap-3">
            {user ? (
              <>
                <Badge variant="outline" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  {dealership?.name || '未知车行'}
                </Badge>
                <Button 
                  onClick={() => {
                    // 判断用户角色和权限
                    if (profile?.role === 'super_admin') {
                      // 超级管理员进入平台管理后台
                      navigate('/platform/dealerships');
                    } else if ((profile?.role === 'admin' || profile?.role === 'employee') && profile?.dealership_id) {
                      // 车行管理员或员工（且已关联车行）进入管理系统
                      navigate('/');
                    } else {
                      // 其他用户（包括未关联车行的用户）进入客户展示页面
                      navigate('/customer-view');
                    }
                  }} 
                  className="gap-2"
                >
                  <HomeIcon className="h-4 w-4" />
                  {profile?.role === 'super_admin' ? '平台管理' : 
                   ((profile?.role === 'admin' || profile?.role === 'employee') && profile?.dealership_id) ? '进入系统' : '查看车辆'}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setRegisterDialogOpen(true)} 
                  className="gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  注册车行
                </Button>
                <Button variant="ghost" onClick={() => navigate('/login')} className="gap-2">
                  <LogIn className="h-4 w-4" />
                  登录
                </Button>
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
            <div className="flex justify-center pt-6">
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
      {/* 平台特色 */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">平台优势</h2>
            <p className="text-muted-foreground">为车行提供全方位的线上展示和管理服务</p>
          </div>
          
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">安全可靠</h3>
                    <p className="text-sm text-muted-foreground">
                      严格审核机制，确保每家车行资质真实有效
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">操作简单</h3>
                    <p className="text-sm text-muted-foreground">
                      直观的管理界面，快速上手，轻松管理车辆信息
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">客户触达</h3>
                    <p className="text-sm text-muted-foreground">
                      统一展示平台，帮助您触达更多潜在客户
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">数据分析</h3>
                    <p className="text-sm text-muted-foreground">
                      完善的统计分析功能，助力业务增长
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full sm:w-48 justify-between"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="flex-1 text-left truncate">
                      {selectedCity === 'all' 
                        ? '全部地区' 
                        : cities.find((city) => city === selectedCity) || '全部地区'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="搜索地区..." />
                    <CommandList>
                      <CommandEmpty>未找到地区</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setSelectedCity('all');
                            setComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedCity === 'all' ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                          全部地区
                        </CommandItem>
                        {cities.map((city) => (
                          <CommandItem
                            key={city}
                            value={city}
                            onSelect={(currentValue) => {
                              setSelectedCity(currentValue);
                              setComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                selectedCity === city ? 'opacity-100' : 'opacity-0'
                              }`}
                            />
                            {city}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                {searchQuery || selectedCity !== 'all' 
                  ? '没有找到符合条件的车辆' 
                  : '平台暂无在售车辆'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVehicles.map((vehicle) => (
                <Card 
                  key={vehicle.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  onClick={() => {
                    setSelectedVehicle(vehicle);
                    setVehicleDetailOpen(true);
                  }}
                >
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
                      {vehicle.selling_price 
                        ? `¥${vehicle.selling_price.toLocaleString()}` 
                        : '价格面议'}
                    </div>
                    {vehicle.condition_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {vehicle.condition_description}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        <span className="line-clamp-1">
                          {vehicle.dealership?.name || '未知车行'}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止事件冒泡
                          // 优先使用display_contact_phone和display_contact_name，如果没有则使用contact_phone和contact_person
                          const displayPhone = vehicle.dealership?.display_contact_phone || vehicle.dealership?.contact_phone;
                          const displayName = vehicle.dealership?.display_contact_name || vehicle.dealership?.contact_person;
                          
                          if (displayPhone && vehicle.dealership) {
                            toast.success(
                              <div className="space-y-1">
                                <div className="font-semibold">{vehicle.dealership.name}</div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  <span>{displayPhone}</span>
                                </div>
                                {displayName && (
                                  <div className="text-xs text-muted-foreground">
                                    联系人：{displayName}
                                  </div>
                                )}
                              </div>,
                              { duration: 5000 }
                            );
                          } else {
                            toast.error('暂无联系方式');
                          }
                        }}
                      >
                        <Phone className="h-3 w-3" />
                        联系方式
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 查看更多按钮 */}
            <div className="flex justify-center mt-12">
              <Button
                size="lg"
                onClick={() => navigate('/vehicle-list')}
                className="gap-2 px-8"
              >
                <Car className="h-5 w-5" />
                查看更多车辆
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </>
          )}
        </div>
      </section>
      {/* 页脚 */}
      <footer className="border-t bg-muted/30">
        <div className="container px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xl font-bold">恏淘车</span>
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
            <p>© 2026 恏淘车经营管理平台 · 专业的二手车车行管理服务</p>
          </div>
        </div>
      </footer>

      {/* 注册车行对话框 */}
      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              注册车行
            </DialogTitle>
            <DialogDescription>
              填写以下信息提交车行注册申请，平台审核通过后即可使用
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                车行名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="请输入车行名称"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">
                车行代码 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                placeholder="请输入车行代码（字母、数字、下划线）"
                value={registerForm.code}
                onChange={(e) => setRegisterForm({ ...registerForm, code: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                车行代码用于系统识别，只能包含字母、数字和下划线
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">
                联系人 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact_person"
                placeholder="请输入联系人姓名"
                value={registerForm.contact_person}
                onChange={(e) => setRegisterForm({ ...registerForm, contact_person: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">
                联系电话 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact_phone"
                type="tel"
                placeholder="请输入联系电话"
                value={registerForm.contact_phone}
                onChange={(e) => setRegisterForm({ ...registerForm, contact_phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">地址</Label>
              <Input
                id="address"
                placeholder="请输入车行地址（选填）"
                value={registerForm.address}
                onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRegisterDialogOpen(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '提交中...' : '提交申请'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 二维码对话框 */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              平台分享
            </DialogTitle>
            <DialogDescription>
              扫描二维码或分享链接，邀请更多车商加入恏淘车平台
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4 p-6 bg-muted/50 rounded-lg">
              <QRCodeDataUrl 
                data={`${window.location.origin}/register`}
                size={200}
              />
              <p className="text-sm text-muted-foreground text-center">
                使用微信扫描二维码，快速访问注册页面
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>注册链接</Label>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/register`}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/register`);
                    toast.success('链接已复制到剪贴板');
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setQrDialogOpen(false)}>
                关闭
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 车辆详情对话框 */}
      <Dialog open={vehicleDetailOpen} onOpenChange={setVehicleDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedVehicle?.brand} {selectedVehicle?.model}
            </DialogTitle>
            <DialogDescription>
              车辆详细信息
            </DialogDescription>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className="space-y-6">
              {/* 车辆照片 */}
              {selectedVehicle.photos && selectedVehicle.photos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">车辆照片</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedVehicle.photos.map((photo, index) => (
                      <div 
                        key={index} 
                        className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setImageViewerOpen(true);
                        }}
                      >
                        <img
                          src={photo}
                          alt={`${selectedVehicle.brand} ${selectedVehicle.model} - ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 基本信息 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary">基本信息</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">品牌型号</div>
                    <div className="font-medium">{selectedVehicle.brand} {selectedVehicle.model}</div>
                  </div>
                  {selectedVehicle.vehicle_type && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">车辆类型</div>
                      <div className="font-medium">
                        {VEHICLE_TYPE_MAP[selectedVehicle.vehicle_type as keyof typeof VEHICLE_TYPE_MAP]}
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">年份</div>
                    <div className="font-medium">{selectedVehicle.year}年</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">里程数</div>
                    <div className="font-medium">{selectedVehicle.mileage?.toLocaleString()} 公里</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">过户次数</div>
                    <div className="font-medium">{selectedVehicle.transfer_count || 0} 次</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">车牌号</div>
                    <div className="font-medium">{selectedVehicle.plate_number}</div>
                  </div>
                </div>
              </div>

              {/* 技术参数 */}
              {(selectedVehicle.displacement || selectedVehicle.transmission_type || selectedVehicle.drive_type || 
                selectedVehicle.fuel_type || selectedVehicle.emission_standard || selectedVehicle.seats) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">技术参数</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(selectedVehicle.displacement ?? 0) > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">排量</div>
                        <div className="font-medium">{selectedVehicle.displacement!.toFixed(1)}{selectedVehicle.is_turbo ? 'T' : 'L'}</div>
                      </div>
                    )}
                    {selectedVehicle.transmission_type && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">变速箱</div>
                        <div className="font-medium">
                          {TRANSMISSION_TYPE_MAP[selectedVehicle.transmission_type as keyof typeof TRANSMISSION_TYPE_MAP]}
                        </div>
                      </div>
                    )}
                    {selectedVehicle.drive_type && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">驱动方式</div>
                        <div className="font-medium">
                          {DRIVE_TYPE_MAP[selectedVehicle.drive_type as keyof typeof DRIVE_TYPE_MAP]}
                        </div>
                      </div>
                    )}
                    {selectedVehicle.fuel_type && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">燃料类型</div>
                        <div className="font-medium">
                          {FUEL_TYPE_MAP[selectedVehicle.fuel_type as keyof typeof FUEL_TYPE_MAP]}
                        </div>
                      </div>
                    )}
                    {selectedVehicle.emission_standard && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">排放标准</div>
                        <div className="font-medium">
                          {EMISSION_STANDARD_MAP[selectedVehicle.emission_standard as keyof typeof EMISSION_STANDARD_MAP]}
                        </div>
                      </div>
                    )}
                    {(selectedVehicle.seats ?? 0) > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">座位数</div>
                        <div className="font-medium">{selectedVehicle.seats}座</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 外观信息 */}
              {(selectedVehicle.exterior_color || selectedVehicle.interior_color) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">外观信息</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedVehicle.exterior_color && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">车身颜色</div>
                        <div className="font-medium">{selectedVehicle.exterior_color}</div>
                      </div>
                    )}
                    {selectedVehicle.interior_color && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">内饰颜色</div>
                        <div className="font-medium">{selectedVehicle.interior_color}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 车辆状态 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary">车辆状态</h3>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedVehicle.is_accident && (
                      <Badge variant="destructive">事故车</Badge>
                    )}
                    {selectedVehicle.is_flooded && (
                      <Badge variant="destructive">泡水车</Badge>
                    )}
                    {selectedVehicle.is_fire && (
                      <Badge variant="destructive">火烧车</Badge>
                    )}
                    {!selectedVehicle.is_accident && !selectedVehicle.is_flooded && !selectedVehicle.is_fire && (
                      <Badge variant="default" className="bg-green-600">车况正常</Badge>
                    )}
                  </div>
                  {selectedVehicle.condition_description && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">车况描述</div>
                      <div className="text-sm">{selectedVehicle.condition_description}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 证件信息 */}
              {(selectedVehicle.insurance_expiry || selectedVehicle.inspection_expiry) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">证件信息</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedVehicle.insurance_expiry && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">保险到期日</div>
                        <div className="font-medium">{selectedVehicle.insurance_expiry}</div>
                      </div>
                    )}
                    {selectedVehicle.inspection_expiry && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">年检到期日</div>
                        <div className="font-medium">{selectedVehicle.inspection_expiry}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 价格信息 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary">价格信息</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(selectedVehicle.original_price ?? 0) > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">新车指导价</div>
                      <div className="font-medium">¥{Number(selectedVehicle.original_price).toLocaleString()}</div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">售价</div>
                    <div className="text-2xl font-bold text-primary">
                      {selectedVehicle.selling_price 
                        ? `¥${Number(selectedVehicle.selling_price).toLocaleString()}` 
                        : '价格面议'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 车行信息 */}
              {selectedVehicle.dealership && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary">车行信息</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">车行名称</div>
                      <div className="font-medium">{selectedVehicle.dealership.name}</div>
                    </div>
                    {selectedVehicle.dealership.city && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">所在城市</div>
                        <div className="font-medium">{selectedVehicle.dealership.city}</div>
                      </div>
                    )}
                    {selectedVehicle.dealership.address && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">地址</div>
                        <div className="font-medium">{selectedVehicle.dealership.address}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setVehicleDetailOpen(false)}
                >
                  关闭
                </Button>
                {(() => {
                  // 优先使用display_contact_phone和display_contact_name，如果没有则使用contact_phone和contact_person
                  const displayPhone = selectedVehicle.dealership?.display_contact_phone || selectedVehicle.dealership?.contact_phone;
                  const displayName = selectedVehicle.dealership?.display_contact_name || selectedVehicle.dealership?.contact_person;
                  
                  return displayPhone ? (
                    <Button
                      onClick={() => {
                        toast.success(
                          <div className="space-y-1">
                            <div className="font-semibold">{selectedVehicle.dealership?.name}</div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{displayPhone}</span>
                            </div>
                            {displayName && (
                              <div className="text-xs text-muted-foreground">
                                联系人：{displayName}
                              </div>
                            )}
                          </div>,
                          { duration: 5000 }
                        );
                      }}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      联系车行
                    </Button>
                  ) : null;
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 图片查看器对话框 */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-[95vh] flex items-center justify-center">
            {/* 关闭按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setImageViewerOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* 图片计数 */}
            {selectedVehicle?.photos && selectedVehicle.photos.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1} / {selectedVehicle.photos.length}
              </div>
            )}

            {/* 左箭头 */}
            {selectedVehicle?.photos && selectedVehicle.photos.length > 1 && currentImageIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-50 text-white hover:bg-white/20 h-12 w-12"
                onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {/* 图片 */}
            {selectedVehicle?.photos && selectedVehicle.photos[currentImageIndex] && (
              <img
                src={selectedVehicle.photos[currentImageIndex]}
                alt={`${selectedVehicle.brand} ${selectedVehicle.model} - ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* 右箭头 */}
            {selectedVehicle?.photos && selectedVehicle.photos.length > 1 && currentImageIndex < selectedVehicle.photos.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-50 text-white hover:bg-white/20 h-12 w-12"
                onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            {/* 缩略图导航 */}
            {selectedVehicle?.photos && selectedVehicle.photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 bg-black/50 rounded-lg">
                {selectedVehicle.photos.map((photo, index) => (
                  <div
                    key={index}
                    className={`relative w-16 h-16 flex-shrink-0 rounded cursor-pointer overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-primary scale-110' : 'border-white/30 hover:border-white/60'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={photo}
                      alt={`缩略图 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
