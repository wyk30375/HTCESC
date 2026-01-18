import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import type { Vehicle, Dealership } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/db/supabase';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';

export default function PublicHomeNew() {
  const navigate = useNavigate();
  const { user, profile, dealership } = useAuth();
  const [loading, setLoading] = useState(true);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  
  // 车辆和车行数据
  const [vehicles, setVehicles] = useState<(Vehicle & { dealership?: Dealership })[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [selectedDealership, setSelectedDealership] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
          <div className="flex items-center justify-end gap-3">
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
              <Button variant="ghost" onClick={() => navigate('/login')} className="gap-2">
                <LogIn className="h-4 w-4" />
                登录
              </Button>
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
                        onClick={() => {
                          if (vehicle.dealership?.contact_phone) {
                            toast.success(
                              <div className="space-y-1">
                                <div className="font-semibold">{vehicle.dealership.name}</div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  <span>{vehicle.dealership.contact_phone}</span>
                                </div>
                                {vehicle.dealership.contact_person && (
                                  <div className="text-xs text-muted-foreground">
                                    联系人：{vehicle.dealership.contact_person}
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
    </div>
  );
}
