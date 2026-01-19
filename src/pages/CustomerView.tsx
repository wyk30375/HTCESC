import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { vehiclesApi } from '@/db/api';
import { useAuth } from '@/context/AuthContext';
import type { Vehicle } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Calendar, Gauge, ArrowLeft, QrCode, Phone } from 'lucide-react';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import { toast } from 'sonner';

export default function CustomerView() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { dealership } = useAuth();

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      // 显示当前车行的在售车辆
      const data = await vehiclesApi.getInStock();
      setVehicles(data);
    } catch (error) {
      console.error('加载车辆数据失败:', error);
      toast.error('加载车辆数据失败');
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
            <Card key={vehicle.id} className="overflow-hidden">
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
                    onClick={() => {
                      if (dealership?.contact_phone) {
                        toast.success('联系方式', {
                          description: `${dealership.name}\n联系电话：${dealership.contact_phone}${dealership.contact_person ? `\n联系人：${dealership.contact_person}` : ''}`,
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
                data={`${window.location.origin}/customer-view`}
                size={200}
              />
            </div>

            <div className="space-y-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <p className="font-medium text-foreground">展示页面链接：</p>
              <p className="break-all font-mono bg-background px-2 py-1 rounded">
                {`${window.location.origin}/customer-view`}
              </p>
              <p className="text-xs">可复制此链接发送给客户</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const url = `${window.location.origin}/customer-view`;
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
    </div>
  );
}
