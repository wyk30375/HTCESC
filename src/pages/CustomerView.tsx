import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { vehiclesApi } from '@/db/api';
import { useAuth } from '@/context/AuthContext';
import type { Vehicle, Dealership } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Calendar, Gauge, ArrowLeft, QrCode, Phone } from 'lucide-react';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';

export default function CustomerView() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentDealership, setCurrentDealership] = useState<Dealership | null>(null);
  const navigate = useNavigate();
  const { dealership, profile } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadVehicles();
  }, [searchParams]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      
      // 1. 从URL参数获取车行ID（扫码访问场景）
      const dealershipIdFromUrl = searchParams.get('dealership');
      
      let targetDealershipId: string | null = null;
      let targetDealership: Dealership | null = null;
      
      if (dealershipIdFromUrl) {
        // 扫码访问：使用URL参数中的车行ID
        targetDealershipId = dealershipIdFromUrl;
        
        // 获取车行信息
        const { data: dealershipData, error: dealershipError } = await supabase
          .from('dealerships')
          .select('*')
          .eq('id', dealershipIdFromUrl)
          .maybeSingle();
        
        if (dealershipError) {
          console.error('获取车行信息失败:', dealershipError);
        } else {
          targetDealership = dealershipData;
        }
      } else if (profile?.dealership_id) {
        // 已登录用户：使用当前用户的车行ID
        targetDealershipId = profile.dealership_id;
        targetDealership = dealership;
      }
      
      if (!targetDealershipId) {
        toast.error('无法获取车行信息');
        setVehicles([]);
        setCurrentDealership(null);
        return;
      }
      
      // 设置当前车行
      setCurrentDealership(targetDealership);
      
      // 2. 查询该车行的在售车辆
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('dealership_id', targetDealershipId)
        .eq('status', 'in_stock')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('加载车辆数据失败:', error);
        toast.error('加载车辆数据失败');
        setVehicles([]);
      } else {
        setVehicles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('加载车辆数据失败:', error);
      toast.error('加载车辆数据失败');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-16 bg-muted" />
          <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96 bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">
                  {dealership?.name || '二手车展示'}
                </h1>
                <p className="text-sm text-muted-foreground">优质车源，诚信经营</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setQrDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                <span className="hidden sm:inline">生成二维码</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/register')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">返回主页</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 车辆列表 */}
      <main className="mx-auto max-w-6xl p-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">在售车辆</h2>
          <p className="text-sm text-muted-foreground mt-1">
            共 {vehicles.length} 辆车
          </p>
        </div>

        <div className="grid gap-6 @md:grid-cols-2 @lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card 
              key={vehicle.id} 
              className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
              onClick={() => {
                setSelectedVehicle(vehicle);
                setDetailDialogOpen(true);
              }}
            >
              {/* 车辆图片 */}
              <div className="aspect-video bg-muted relative">
                {vehicle.photos && vehicle.photos.length > 0 ? (
                  <img
                    src={vehicle.photos[0]}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Car className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <Badge className="absolute right-2 top-2">在售</Badge>
              </div>

              {/* 车辆信息 */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    车架号：{vehicle.vin_last_six}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{vehicle.year}年</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge className="h-4 w-4" />
                    <span>{vehicle.mileage.toLocaleString()}km</span>
                  </div>
                </div>

                {vehicle.condition_description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {vehicle.condition_description}
                  </p>
                )}

                <div className="pt-2 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">价格面议</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止事件冒泡
                      if (currentDealership?.contact_phone) {
                        toast.success('联系方式', {
                          description: `${currentDealership.name}\n联系电话：${currentDealership.contact_phone}${currentDealership.contact_person ? `\n联系人：${currentDealership.contact_person}` : ''}`,
                          duration: 5000,
                        });
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

        {vehicles.length === 0 && (
          <div className="rounded-lg border bg-card p-12 text-center">
            <Car className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">暂无在售车辆</p>
          </div>
        )}
      </main>

      {/* 二维码对话框 */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">客户展示页面二维码</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>客户可扫描此二维码查看在售车辆：</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>实时展示所有在售车辆</li>
                <li>查看车辆详细信息和照片</li>
                <li>方便客户随时浏览</li>
              </ul>
            </div>
            
            <div className="flex flex-col items-center justify-center py-6 bg-muted/30 rounded-lg">
              <QRCodeDataUrl
                data={`${window.location.origin}/customer-view?dealership=${currentDealership?.id || profile?.dealership_id || ''}`}
                size={200}
              />
            </div>

            <div className="space-y-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <p className="font-medium text-foreground">展示页面链接：</p>
              <p className="break-all font-mono bg-background px-2 py-1 rounded">
                {`${window.location.origin}/customer-view?dealership=${currentDealership?.id || profile?.dealership_id || ''}`}
              </p>
              <p className="text-xs">可复制此链接发送给客户</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const url = `${window.location.origin}/customer-view?dealership=${currentDealership?.id || profile?.dealership_id || ''}`;
                  navigator.clipboard.writeText(url);
                  toast.success('链接已复制到剪贴板');
                }}
                className="h-10"
              >
                复制链接
              </Button>
              <Button onClick={() => setQrDialogOpen(false)} className="h-10">
                关闭
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 车辆详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">车辆详情</DialogTitle>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className="space-y-6">
              {/* 车辆图片轮播 */}
              {selectedVehicle.photos && selectedVehicle.photos.length > 0 && (
                <div className="space-y-2">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={selectedVehicle.photos[0]}
                      alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {selectedVehicle.photos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedVehicle.photos.slice(1, 5).map((photo, index) => (
                        <div key={index} className="aspect-video bg-muted rounded overflow-hidden">
                          <img
                            src={photo}
                            alt={`${selectedVehicle.brand} ${selectedVehicle.model} - ${index + 2}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 基本信息 */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge>在售</Badge>
                    <span className="text-sm text-muted-foreground">
                      车架号后六位：{selectedVehicle.vin_last_six}
                    </span>
                  </div>
                </div>

                {/* 详细参数 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">年份：</span>
                      <span className="font-medium">{selectedVehicle.year}年</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">里程：</span>
                      <span className="font-medium">{selectedVehicle.mileage?.toLocaleString()}公里</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">车牌号：</span>
                      <span className="font-medium">{selectedVehicle.license_plate || '暂无'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {selectedVehicle.color && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">颜色：</span>
                        <span className="font-medium">{selectedVehicle.color}</span>
                      </div>
                    )}
                    {selectedVehicle.displacement && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">排量：</span>
                        <span className="font-medium">{selectedVehicle.displacement}</span>
                      </div>
                    )}
                    {selectedVehicle.transmission && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">变速箱：</span>
                        <span className="font-medium">{selectedVehicle.transmission}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 车况描述 */}
                {selectedVehicle.condition_description && (
                  <div className="space-y-2">
                    <h4 className="font-medium">车况描述</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedVehicle.condition_description}
                    </p>
                  </div>
                )}

                {/* 联系方式 */}
                <div className="pt-4 border-t space-y-3">
                  <h4 className="font-medium">联系我们</h4>
                  {currentDealership && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">车行：</span>
                        <span className="font-medium">{currentDealership.name}</span>
                      </div>
                      {currentDealership.contact_phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">电话：</span>
                          <span className="font-medium">{currentDealership.contact_phone}</span>
                        </div>
                      )}
                      {currentDealership.contact_person && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">联系人：</span>
                          <span className="font-medium">{currentDealership.contact_person}</span>
                        </div>
                      )}
                      {currentDealership.address && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">地址：</span>
                          <span className="font-medium">{currentDealership.address}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      if (currentDealership?.contact_phone) {
                        toast.success('联系方式', {
                          description: `${currentDealership.name}\n联系电话：${currentDealership.contact_phone}${currentDealership.contact_person ? `\n联系人：${currentDealership.contact_person}` : ''}`,
                          duration: 5000,
                        });
                      } else {
                        toast.error('暂无联系方式');
                      }
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    联系车行
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
