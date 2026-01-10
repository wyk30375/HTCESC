import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { vehiclesApi, vehicleCostsApi } from '@/db/api';
import type { Vehicle } from '@/types/types';
import { Plus, Edit, Eye, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ImageUpload from '@/components/common/ImageUpload';
import { useAuth } from '@/context/AuthContext';

export default function Vehicles() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState('in_stock');

  const [formData, setFormData] = useState({
    vin_last_six: '',
    plate_number: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    condition_description: '',
    photos: [] as string[],
    purchase_price: 0,
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehiclesApi.getAll();
      setVehicles(data);
    } catch (error) {
      console.error('加载车辆数据失败:', error);
      toast.error('加载车辆数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 如果是编辑模式且不是管理员，阻止操作
    if (editingVehicle && !isAdmin) {
      toast.error('只有管理员可以修改已有车辆信息');
      return;
    }
    
    try {
      if (editingVehicle) {
        await vehiclesApi.update(editingVehicle.id, formData);
        toast.success('车辆信息已更新');
      } else {
        const vehicle = await vehiclesApi.create({ ...formData, status: 'in_stock' } as any);
        
        // 添加购车款成本
        if (vehicle && formData.purchase_price > 0) {
          await vehicleCostsApi.add({
            vehicle_id: vehicle.id,
            cost_type: 'purchase',
            amount: formData.purchase_price,
            description: '购车款',
          });
        }
        
        toast.success('车辆已入库');
      }
      setDialogOpen(false);
      resetForm();
      loadVehicles();
    } catch (error) {
      console.error('保存车辆失败:', error);
      toast.error('保存车辆失败');
    }
  };

  const resetForm = () => {
    setFormData({
      vin_last_six: '',
      plate_number: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      mileage: 0,
      condition_description: '',
      photos: [],
      purchase_price: 0,
    });
    setEditingVehicle(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (vehicle: Vehicle) => {
    if (!isAdmin) {
      toast.error('只有管理员可以修改已有车辆信息');
      return;
    }
    
    setEditingVehicle(vehicle);
    setFormData({
      vin_last_six: vehicle.vin_last_six,
      plate_number: vehicle.plate_number,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      condition_description: vehicle.condition_description || '',
      photos: vehicle.photos || [],
      purchase_price: Number(vehicle.purchase_price),
    });
    setDialogOpen(true);
  };

  const filteredVehicles = vehicles.filter((v) => v.status === activeTab);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-muted" />
        <Skeleton className="h-96 bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">车辆管理</h1>
          <p className="text-muted-foreground mt-2">
            管理车辆入库、在售和已售信息
            {!isAdmin && (
              <span className="ml-2 text-xs text-amber-600">
                （员工权限：可录入新车辆，不可修改已有数据）
              </span>
            )}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              车辆入库
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVehicle ? '编辑车辆' : '车辆入库'}
                {editingVehicle && !isAdmin && (
                  <span className="ml-2 text-sm text-destructive">（需要管理员权限）</span>
                )}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vin_last_six">车架号后六位</Label>
                  <Input
                    id="vin_last_six"
                    value={formData.vin_last_six}
                    onChange={(e) => setFormData({ ...formData, vin_last_six: e.target.value })}
                    maxLength={6}
                    required
                    disabled={!!editingVehicle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate_number">车牌号</Label>
                  <Input
                    id="plate_number"
                    value={formData.plate_number}
                    onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">品牌</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">型号</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">年份</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">里程数（公里）</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_price">购车款（元）</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition_description">车况描述</Label>
                <Textarea
                  id="condition_description"
                  value={formData.condition_description}
                  onChange={(e) => setFormData({ ...formData, condition_description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>车辆照片</Label>
                <ImageUpload
                  images={formData.photos}
                  onImagesChange={(photos) => setFormData({ ...formData, photos })}
                  maxImages={10}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={!!(editingVehicle && !isAdmin)}>
                  {editingVehicle && !isAdmin ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      需要管理员权限
                    </>
                  ) : (
                    '保存'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>车辆列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="in_stock">在售车辆</TabsTrigger>
              <TabsTrigger value="sold">已售车辆</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>车架号</TableHead>
                    <TableHead>车牌号</TableHead>
                    <TableHead>品牌型号</TableHead>
                    <TableHead>年份</TableHead>
                    <TableHead>里程</TableHead>
                    <TableHead>购车款</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.vin_last_six}</TableCell>
                      <TableCell>{vehicle.plate_number}</TableCell>
                      <TableCell>{vehicle.brand} {vehicle.model}</TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                      <TableCell>¥{Number(vehicle.purchase_price).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={vehicle.status === 'in_stock' ? 'default' : 'secondary'}>
                          {vehicle.status === 'in_stock' ? '在售' : '已售'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {isAdmin ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(vehicle)}
                              title="编辑车辆"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled
                              title="只有管理员可以编辑"
                            >
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
