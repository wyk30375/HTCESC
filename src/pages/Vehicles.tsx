import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { vehiclesApi, vehicleCostsApi, profilesApi, getCurrentDealershipId } from '@/db/api';
import type { Vehicle, Profile } from '@/types/types';
import { Plus, Edit, Eye, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ImageUpload from '@/components/common/ImageUpload';
import { useAuth } from '@/context/AuthContext';
import {
  VEHICLE_TYPE_OPTIONS,
  TRANSMISSION_TYPE_OPTIONS,
  DRIVE_TYPE_OPTIONS,
  FUEL_TYPE_OPTIONS,
  EMISSION_STANDARD_OPTIONS,
  SEATS_OPTIONS,
  EXTERIOR_COLOR_OPTIONS,
  INTERIOR_COLOR_OPTIONS,
  VEHICLE_TYPE_MAP,
  TRANSMISSION_TYPE_MAP,
  DRIVE_TYPE_MAP,
  FUEL_TYPE_MAP,
  EMISSION_STANDARD_MAP
} from '@/types/vehicleEnums';

export default function Vehicles() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [activeTab, setActiveTab] = useState('in_stock');

  const [formData, setFormData] = useState({
    // 基本识别信息
    vin_last_six: '',
    vin_full: '',
    plate_number: '',
    engine_number: '',
    
    // 车辆基本信息
    brand: '',
    model: '',
    vehicle_type: '' as any,
    year: new Date().getFullYear(),
    mileage: 0,
    
    // 车辆技术参数
    displacement: 0,
    transmission_type: '' as any,
    drive_type: '' as any,
    fuel_type: '' as any,
    emission_standard: '' as any,
    seats: 5,
    
    // 车辆外观
    exterior_color: '',
    interior_color: '',
    
    // 车辆状态
    transfer_count: 0,
    is_accident: false,
    is_flooded: false,
    is_fire: false,
    condition_description: '',
    
    // 证件信息
    insurance_expiry: '',
    inspection_expiry: '',
    
    // 价格信息
    original_price: 0,
    purchase_price: 0,
    selling_price: 0,
    
    // 其他
    photos: [] as string[],
    investor_ids: [] as string[],
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const [vehiclesData, profilesData] = await Promise.all([
        vehiclesApi.getAll(),
        profilesApi.getAll(),
      ]);
      setVehicles(vehiclesData);
      setProfiles(profilesData);
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
      // 清理数据：将空字符串转换为null（枚举类型字段）
      const cleanedData = {
        ...formData,
        vehicle_type: formData.vehicle_type || null,
        transmission_type: formData.transmission_type || null,
        drive_type: formData.drive_type || null,
        fuel_type: formData.fuel_type || null,
        emission_standard: formData.emission_standard || null,
      };
      
      if (editingVehicle) {
        await vehiclesApi.update(editingVehicle.id, cleanedData);
        toast.success('车辆信息已更新');
      } else {
        const vehicle = await vehiclesApi.create({ ...cleanedData, status: 'in_stock' } as any);
        
        // 添加购车款成本
        if (vehicle && formData.purchase_price > 0) {
          const dealershipId = await getCurrentDealershipId();
          await vehicleCostsApi.add({
            vehicle_id: vehicle.id,
            dealership_id: dealershipId,
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
      // 基本识别信息
      vin_last_six: '',
      vin_full: '',
      plate_number: '',
      engine_number: '',
      
      // 车辆基本信息
      brand: '',
      model: '',
      vehicle_type: '' as any,
      year: new Date().getFullYear(),
      mileage: 0,
      
      // 车辆技术参数
      displacement: 0,
      transmission_type: '' as any,
      drive_type: '' as any,
      fuel_type: '' as any,
      emission_standard: '' as any,
      seats: 5,
      
      // 车辆外观
      exterior_color: '',
      interior_color: '',
      
      // 车辆状态
      transfer_count: 0,
      is_accident: false,
      is_flooded: false,
      is_fire: false,
      condition_description: '',
      
      // 证件信息
      insurance_expiry: '',
      inspection_expiry: '',
      
      // 价格信息
      original_price: 0,
      purchase_price: 0,
      selling_price: 0,
      
      // 其他
      photos: [],
      investor_ids: [],
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
    
    // 解析 investor_ids
    let investorIds: string[] = [];
    
    try {
      if (vehicle.investor_ids) {
        investorIds = typeof vehicle.investor_ids === 'string' 
          ? JSON.parse(vehicle.investor_ids) 
          : vehicle.investor_ids;
      }
    } catch (error) {
      console.error('解析出资人ID失败:', error);
    }
    
    setEditingVehicle(vehicle);
    setFormData({
      // 基本识别信息
      vin_last_six: vehicle.vin_last_six,
      vin_full: vehicle.vin_full || '',
      plate_number: vehicle.plate_number,
      engine_number: vehicle.engine_number || '',
      
      // 车辆基本信息
      brand: vehicle.brand,
      model: vehicle.model,
      vehicle_type: vehicle.vehicle_type || '' as any,
      year: vehicle.year,
      mileage: vehicle.mileage,
      
      // 车辆技术参数
      displacement: vehicle.displacement || 0,
      transmission_type: vehicle.transmission_type || '' as any,
      drive_type: vehicle.drive_type || '' as any,
      fuel_type: vehicle.fuel_type || '' as any,
      emission_standard: vehicle.emission_standard || '' as any,
      seats: vehicle.seats || 5,
      
      // 车辆外观
      exterior_color: vehicle.exterior_color || '',
      interior_color: vehicle.interior_color || '',
      
      // 车辆状态
      transfer_count: vehicle.transfer_count || 0,
      is_accident: vehicle.is_accident || false,
      is_flooded: vehicle.is_flooded || false,
      is_fire: vehicle.is_fire || false,
      condition_description: vehicle.condition_description || '',
      
      // 证件信息
      insurance_expiry: vehicle.insurance_expiry || '',
      inspection_expiry: vehicle.inspection_expiry || '',
      
      // 价格信息
      original_price: vehicle.original_price ? Number(vehicle.original_price) : 0,
      purchase_price: Number(vehicle.purchase_price),
      selling_price: vehicle.selling_price ? Number(vehicle.selling_price) : 0,
      
      // 其他
      photos: vehicle.photos || [],
      investor_ids: investorIds,
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
              {/* 基本识别信息 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary">基本识别信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vin_last_six">车架号后六位 *</Label>
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
                    <Label htmlFor="plate_number">车牌号 *</Label>
                    <Input
                      id="plate_number"
                      value={formData.plate_number}
                      onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vin_full">完整车架号（VIN）</Label>
                    <Input
                      id="vin_full"
                      value={formData.vin_full}
                      onChange={(e) => setFormData({ ...formData, vin_full: e.target.value })}
                      maxLength={17}
                      placeholder="17位车架号"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="engine_number">发动机号</Label>
                    <Input
                      id="engine_number"
                      value={formData.engine_number}
                      onChange={(e) => setFormData({ ...formData, engine_number: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 车辆基本信息 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary">车辆基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">品牌 *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">型号 *</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_type">车辆类型</Label>
                    <Select
                      value={formData.vehicle_type}
                      onValueChange={(value) => setFormData({ ...formData, vehicle_type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择车辆类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">年份 *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mileage">里程数（公里）*</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transfer_count">过户次数 *</Label>
                    <Input
                      id="transfer_count"
                      type="number"
                      min="0"
                      value={formData.transfer_count}
                      onChange={(e) => setFormData({ ...formData, transfer_count: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 车辆技术参数 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary">车辆技术参数</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displacement">排量（升）</Label>
                    <Input
                      id="displacement"
                      type="number"
                      step="0.1"
                      value={formData.displacement || ''}
                      onChange={(e) => setFormData({ ...formData, displacement: Number(e.target.value) })}
                      placeholder="例如：1.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transmission_type">变速箱类型</Label>
                    <Select
                      value={formData.transmission_type}
                      onValueChange={(value) => setFormData({ ...formData, transmission_type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择变速箱类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSMISSION_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drive_type">驱动方式</Label>
                    <Select
                      value={formData.drive_type}
                      onValueChange={(value) => setFormData({ ...formData, drive_type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择驱动方式" />
                      </SelectTrigger>
                      <SelectContent>
                        {DRIVE_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuel_type">燃料类型</Label>
                    <Select
                      value={formData.fuel_type}
                      onValueChange={(value) => setFormData({ ...formData, fuel_type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择燃料类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {FUEL_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emission_standard">排放标准</Label>
                    <Select
                      value={formData.emission_standard}
                      onValueChange={(value) => setFormData({ ...formData, emission_standard: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择排放标准" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMISSION_STANDARD_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seats">座位数</Label>
                    <Select
                      value={String(formData.seats)}
                      onValueChange={(value) => setFormData({ ...formData, seats: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择座位数" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEATS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 车辆外观 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary">车辆外观</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exterior_color">车身颜色</Label>
                    <Select
                      value={formData.exterior_color}
                      onValueChange={(value) => setFormData({ ...formData, exterior_color: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择车身颜色" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXTERIOR_COLOR_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interior_color">内饰颜色</Label>
                    <Select
                      value={formData.interior_color}
                      onValueChange={(value) => setFormData({ ...formData, interior_color: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择内饰颜色" />
                      </SelectTrigger>
                      <SelectContent>
                        {INTERIOR_COLOR_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 车辆状态 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary">车辆状态</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_accident"
                      checked={formData.is_accident}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_accident: checked as boolean })}
                    />
                    <Label htmlFor="is_accident" className="text-sm font-normal cursor-pointer">
                      事故车
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_flooded"
                      checked={formData.is_flooded}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_flooded: checked as boolean })}
                    />
                    <Label htmlFor="is_flooded" className="text-sm font-normal cursor-pointer">
                      泡水车
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_fire"
                      checked={formData.is_fire}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_fire: checked as boolean })}
                    />
                    <Label htmlFor="is_fire" className="text-sm font-normal cursor-pointer">
                      火烧车
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition_description">车况描述</Label>
                  <Textarea
                    id="condition_description"
                    value={formData.condition_description}
                    onChange={(e) => setFormData({ ...formData, condition_description: e.target.value })}
                    rows={3}
                    placeholder="请详细描述车辆状况..."
                  />
                </div>
              </div>

              {/* 证件信息 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary">证件信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insurance_expiry">保险到期日</Label>
                    <Input
                      id="insurance_expiry"
                      type="date"
                      value={formData.insurance_expiry}
                      onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inspection_expiry">年检到期日</Label>
                    <Input
                      id="inspection_expiry"
                      type="date"
                      value={formData.inspection_expiry}
                      onChange={(e) => setFormData({ ...formData, inspection_expiry: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 价格信息 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary">价格信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="original_price">新车指导价（元）</Label>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      value={formData.original_price || ''}
                      onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                      placeholder="新车购置价"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_price">购车款（元）*</Label>
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
                    <Label htmlFor="selling_price">预售报价（元）</Label>
                    <Input
                      id="selling_price"
                      type="number"
                      step="0.01"
                      value={formData.selling_price || ''}
                      onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                      placeholder="对外展示价格"
                    />
                  </div>
                </div>
              </div>

              {/* 押车出资人选择 */}
              <div className="space-y-2">
                <Label>押车出资人（可多选，平分36%利润）</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {profiles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">暂无员工数据</p>
                  ) : (
                    profiles.map((person) => (
                      <div key={person.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`vehicle-investor-${person.id}`}
                          checked={formData.investor_ids.includes(person.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                investor_ids: [...formData.investor_ids, person.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                investor_ids: formData.investor_ids.filter((id) => id !== person.id),
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={`vehicle-investor-${person.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {person.username || person.email}
                          {person.id === profile?.id && ' (我)'}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  已选择 {formData.investor_ids.length} 人
                </p>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>车架号</TableHead>
                      <TableHead>车牌号</TableHead>
                      <TableHead>品牌型号</TableHead>
                      <TableHead>车辆类型</TableHead>
                      <TableHead>年份</TableHead>
                      <TableHead>里程</TableHead>
                      <TableHead>过户次数</TableHead>
                      <TableHead>排量</TableHead>
                      <TableHead>变速箱</TableHead>
                      <TableHead>驱动</TableHead>
                      <TableHead>燃料</TableHead>
                      <TableHead>排放</TableHead>
                      <TableHead>座位数</TableHead>
                      <TableHead>车身颜色</TableHead>
                      <TableHead>内饰颜色</TableHead>
                      <TableHead>车况</TableHead>
                      <TableHead>保险到期</TableHead>
                      <TableHead>年检到期</TableHead>
                      <TableHead>新车指导价</TableHead>
                      <TableHead>购车款</TableHead>
                      <TableHead>预售报价</TableHead>
                      <TableHead>押车出资人</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => {
                      // 解析押车出资人ID
                      let investorIds: string[] = [];
                      try {
                        if (vehicle.investor_ids) {
                          investorIds = typeof vehicle.investor_ids === 'string' 
                            ? JSON.parse(vehicle.investor_ids) 
                            : vehicle.investor_ids;
                        }
                      } catch (error) {
                        console.error('解析出资人ID失败:', error);
                      }
                      
                      // 获取出资人信息
                      const investors = profiles.filter(p => investorIds.includes(p.id));
                      
                      // 车况标记
                      const conditionBadges: string[] = [];
                      if (vehicle.is_accident) conditionBadges.push('事故');
                      if (vehicle.is_flooded) conditionBadges.push('泡水');
                      if (vehicle.is_fire) conditionBadges.push('火烧');
                      
                      return (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.vin_last_six}</TableCell>
                        <TableCell>{vehicle.plate_number}</TableCell>
                        <TableCell className="whitespace-nowrap">{vehicle.brand} {vehicle.model}</TableCell>
                        <TableCell>
                          {vehicle.vehicle_type ? (
                            VEHICLE_TYPE_MAP[vehicle.vehicle_type as keyof typeof VEHICLE_TYPE_MAP] || '-'
                          ) : '-'}
                        </TableCell>
                        <TableCell>{vehicle.year}</TableCell>
                        <TableCell className="whitespace-nowrap">{vehicle.mileage.toLocaleString()} km</TableCell>
                        <TableCell>{vehicle.transfer_count || 0} 次</TableCell>
                        <TableCell>{vehicle.displacement ? `${vehicle.displacement}L` : '-'}</TableCell>
                        <TableCell>
                          {vehicle.transmission_type ? (
                            TRANSMISSION_TYPE_MAP[vehicle.transmission_type as keyof typeof TRANSMISSION_TYPE_MAP] || '-'
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {vehicle.drive_type ? (
                            DRIVE_TYPE_MAP[vehicle.drive_type as keyof typeof DRIVE_TYPE_MAP] || '-'
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {vehicle.fuel_type ? (
                            FUEL_TYPE_MAP[vehicle.fuel_type as keyof typeof FUEL_TYPE_MAP] || '-'
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {vehicle.emission_standard ? (
                            EMISSION_STANDARD_MAP[vehicle.emission_standard as keyof typeof EMISSION_STANDARD_MAP] || '-'
                          ) : '-'}
                        </TableCell>
                        <TableCell>{vehicle.seats ? `${vehicle.seats}座` : '-'}</TableCell>
                        <TableCell>{vehicle.exterior_color || '-'}</TableCell>
                        <TableCell>{vehicle.interior_color || '-'}</TableCell>
                        <TableCell>
                          {conditionBadges.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {conditionBadges.map((badge) => (
                                <Badge key={badge} variant="destructive" className="text-xs">
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-green-600 text-sm">正常</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {vehicle.insurance_expiry || '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {vehicle.inspection_expiry || '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {vehicle.original_price ? `¥${Number(vehicle.original_price).toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">¥{Number(vehicle.purchase_price).toLocaleString()}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {vehicle.selling_price ? `¥${Number(vehicle.selling_price).toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell>
                          {investors.length > 0 ? (
                            <div className="space-y-1">
                              {investors.map((investor) => (
                                <div key={investor.id} className="text-sm whitespace-nowrap">
                                  {investor.username || investor.email}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">未指定</span>
                          )}
                        </TableCell>
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
