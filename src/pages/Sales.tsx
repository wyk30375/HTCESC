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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { vehiclesApi, vehicleSalesApi, vehicleCostsApi, employeesApi, profitDistributionsApi } from '@/db/api';
import type { Vehicle, VehicleSale, Employee } from '@/types/types';
import { Plus, Eye, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

export default function Sales() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const [sales, setSales] = useState<VehicleSale[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<VehicleSale | null>(null);

  const [formData, setFormData] = useState({
    vehicle_id: '',
    sale_date: new Date().toISOString().split('T')[0],
    sale_price: 0,
    customer_name: '',
    customer_contact: '',
    customer_id_number: '',
    salesperson_id: '',
    has_loan: false,
    loan_rebate: 0,
    sale_preparation_cost: 0,
    sale_transfer_cost: 0,
    sale_misc_cost: 0,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, vehiclesData, employeesData] = await Promise.all([
        vehicleSalesApi.getAll(),
        vehiclesApi.getInStock(),
        employeesApi.getActive(),
      ]);
      setSales(salesData);
      setVehicles(vehiclesData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('加载销售数据失败:', error);
      toast.error('加载销售数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 计算总利润
      const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
      if (!vehicle) {
        toast.error('请选择车辆');
        return;
      }

      // 获取车辆总成本
      const costs = await vehicleCostsApi.getByVehicleId(formData.vehicle_id);
      const totalCost = costs.reduce((sum, cost) => sum + Number(cost.amount), 0);
      
      // 计算销售总成本
      const saleTotalCost = totalCost + 
        formData.sale_preparation_cost + 
        formData.sale_transfer_cost + 
        formData.sale_misc_cost;
      
      // 计算总利润
      const totalProfit = formData.sale_price - saleTotalCost + (formData.has_loan ? formData.loan_rebate : 0);

      // 创建销售记录
      await vehicleSalesApi.create({
        ...formData,
        total_cost: saleTotalCost,
        total_profit: totalProfit,
      } as any);

      // 添加销售相关成本
      if (formData.sale_preparation_cost > 0) {
        await vehicleCostsApi.add({
          vehicle_id: formData.vehicle_id,
          cost_type: 'preparation',
          amount: formData.sale_preparation_cost,
          description: '销售整备费',
        });
      }
      if (formData.sale_transfer_cost > 0) {
        await vehicleCostsApi.add({
          vehicle_id: formData.vehicle_id,
          cost_type: 'transfer',
          amount: formData.sale_transfer_cost,
          description: '销售过户费',
        });
      }
      if (formData.sale_misc_cost > 0) {
        await vehicleCostsApi.add({
          vehicle_id: formData.vehicle_id,
          cost_type: 'misc',
          amount: formData.sale_misc_cost,
          description: '销售杂费',
        });
      }

      // 更新车辆状态为已售
      await vehiclesApi.update(formData.vehicle_id, { status: 'sold' });

      toast.success('销售记录已创建');
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('创建销售记录失败:', error);
      toast.error('创建销售记录失败');
    }
  };

  const resetForm = () => {
    setFormData({
      vehicle_id: '',
      sale_date: new Date().toISOString().split('T')[0],
      sale_price: 0,
      customer_name: '',
      customer_contact: '',
      customer_id_number: '',
      salesperson_id: '',
      has_loan: false,
      loan_rebate: 0,
      sale_preparation_cost: 0,
      sale_transfer_cost: 0,
      sale_misc_cost: 0,
      notes: '',
    });
  };

  const openDetailDialog = (sale: VehicleSale) => {
    setSelectedSale(sale);
    setDetailDialogOpen(true);
  };

  const getVehicleInfo = (vehicleId: string) => {
    const allVehicles = [...vehicles];
    return allVehicles.find(v => v.id === vehicleId);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || '-';
  };

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
          <h1 className="text-3xl font-bold">销售管理</h1>
          <p className="text-muted-foreground mt-2">
            管理车辆销售记录和客户信息
            {!isAdmin && (
              <span className="ml-2 text-xs text-amber-600">
                （员工权限：可创建销售记录，不可修改）
              </span>
            )}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              记录销售
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>记录车辆销售</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="vehicle_id">选择车辆</Label>
                  <Select
                    value={formData.vehicle_id}
                    onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择要销售的车辆" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} ({vehicle.vin_last_six}) - ¥{Number(vehicle.purchase_price).toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sale_date">销售日期</Label>
                  <Input
                    id="sale_date"
                    type="date"
                    value={formData.sale_date}
                    onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sale_price">成交价格（元）</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_name">客户姓名</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_contact">客户联系方式</Label>
                  <Input
                    id="customer_contact"
                    value={formData.customer_contact}
                    onChange={(e) => setFormData({ ...formData, customer_contact: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="customer_id_number">客户身份证号</Label>
                  <Input
                    id="customer_id_number"
                    value={formData.customer_id_number}
                    onChange={(e) => setFormData({ ...formData, customer_id_number: e.target.value })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="salesperson_id">销售员</Label>
                  <Select
                    value={formData.salesperson_id}
                    onValueChange={(value) => setFormData({ ...formData, salesperson_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择销售员" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sale_preparation_cost">销售整备费（元）</Label>
                  <Input
                    id="sale_preparation_cost"
                    type="number"
                    step="0.01"
                    value={formData.sale_preparation_cost}
                    onChange={(e) => setFormData({ ...formData, sale_preparation_cost: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sale_transfer_cost">销售过户费（元）</Label>
                  <Input
                    id="sale_transfer_cost"
                    type="number"
                    step="0.01"
                    value={formData.sale_transfer_cost}
                    onChange={(e) => setFormData({ ...formData, sale_transfer_cost: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="sale_misc_cost">销售杂费（元）</Label>
                  <Input
                    id="sale_misc_cost"
                    type="number"
                    step="0.01"
                    value={formData.sale_misc_cost}
                    onChange={(e) => setFormData({ ...formData, sale_misc_cost: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_loan"
                      checked={formData.has_loan}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_loan: !!checked })}
                    />
                    <Label htmlFor="has_loan">有贷款返利</Label>
                  </div>
                </div>

                {formData.has_loan && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="loan_rebate">贷款返利金额（元）</Label>
                    <Input
                      id="loan_rebate"
                      type="number"
                      step="0.01"
                      value={formData.loan_rebate}
                      onChange={(e) => setFormData({ ...formData, loan_rebate: Number(e.target.value) })}
                    />
                  </div>
                )}

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">备注</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>销售记录</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>销售日期</TableHead>
                <TableHead>车辆信息</TableHead>
                <TableHead>客户姓名</TableHead>
                <TableHead>成交价格</TableHead>
                <TableHead>总利润</TableHead>
                <TableHead>销售员</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => {
                const vehicle = getVehicleInfo(sale.vehicle_id);
                return (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.sale_date}</TableCell>
                    <TableCell>
                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : '-'}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {vehicle?.vin_last_six}
                      </span>
                    </TableCell>
                    <TableCell>{sale.customer_name}</TableCell>
                    <TableCell className="font-medium">
                      ¥{Number(sale.sale_price).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={Number(sale.total_profit) > 0 ? 'default' : 'secondary'}>
                        ¥{Number(sale.total_profit).toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell>{getEmployeeName(sale.salesperson_id)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDetailDialog(sale)}
                        title="查看详情"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>销售详情</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">销售日期</Label>
                  <p className="font-medium">{selectedSale.sale_date}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">成交价格</Label>
                  <p className="font-medium">¥{Number(selectedSale.sale_price).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">客户姓名</Label>
                  <p className="font-medium">{selectedSale.customer_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">客户联系方式</Label>
                  <p className="font-medium">{selectedSale.customer_contact}</p>
                </div>
                {selectedSale.customer_id_number && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">客户身份证号</Label>
                    <p className="font-medium">{selectedSale.customer_id_number}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">销售员</Label>
                  <p className="font-medium">{getEmployeeName(selectedSale.salesperson_id)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">贷款返利</Label>
                  <p className="font-medium">
                    {selectedSale.has_loan ? `¥${Number(selectedSale.loan_rebate).toLocaleString()}` : '无'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">总成本</Label>
                  <p className="font-medium">¥{Number(selectedSale.total_cost).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">总利润</Label>
                  <p className="font-medium text-primary">¥{Number(selectedSale.total_profit).toLocaleString()}</p>
                </div>
                {selectedSale.notes && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">备注</Label>
                    <p className="font-medium">{selectedSale.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
