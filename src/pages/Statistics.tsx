import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { vehicleSalesApi, vehiclesApi, vehicleCostsApi, profilesApi } from '@/db/api';
import type { VehicleSale, Vehicle, Profile } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { TrendingUp, DollarSign, Package, Award, Car as CarIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Statistics() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [sales, setSales] = useState<VehicleSale[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // 生成月份选项（最近12个月）
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().slice(0, 7);
  });

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, vehiclesData, profilesData] = await Promise.all([
        vehicleSalesApi.getAll(),
        vehiclesApi.getAll(),
        profilesApi.getAll(),
      ]);
      setSales(salesData);
      setVehicles(vehiclesData);
      setProfiles(profilesData);
    } catch (error) {
      console.error('加载统计数据失败:', error);
      toast.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 筛选当月销售记录
  const monthlySales = sales.filter(sale => sale.sale_date.startsWith(selectedMonth));

  // 计算月度统计数据
  const monthlyStats = {
    salesCount: monthlySales.length,
    totalRevenue: monthlySales.reduce((sum, sale) => sum + Number(sale.sale_price), 0),
    averagePrice: monthlySales.length > 0 
      ? monthlySales.reduce((sum, sale) => sum + Number(sale.sale_price), 0) / monthlySales.length 
      : 0,
    totalProfit: monthlySales.reduce((sum, sale) => sum + Number(sale.total_profit || 0), 0),
  };

  // 计算库存统计
  const inventoryStats = {
    inStock: vehicles.filter(v => v.status === 'in_stock').length,
    sold: vehicles.filter(v => v.status === 'sold').length,
    total: vehicles.length,
  };

  // 员工销售排行
  const employeeRanking = profiles.map(profile => {
    const employeeSales = monthlySales.filter(sale => sale.salesperson_id === profile.id);
    return {
      profile,
      salesCount: employeeSales.length,
      totalRevenue: employeeSales.reduce((sum, sale) => sum + Number(sale.sale_price), 0),
      totalProfit: employeeSales.reduce((sum, sale) => sum + Number(sale.total_profit || 0), 0),
    };
  }).filter(item => item.salesCount > 0)
    .sort((a, b) => b.totalProfit - a.totalProfit);

  // 最近6个月销售趋势
  const salesTrend = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toISOString().slice(0, 7);
    const monthSales = sales.filter(sale => sale.sale_date.startsWith(month));
    return {
      month: month.slice(5, 7) + '月',
      销售数量: monthSales.length,
      销售额: Math.round(monthSales.reduce((sum, sale) => sum + Number(sale.sale_price), 0) / 10000),
      利润: Math.round(monthSales.reduce((sum, sale) => sum + Number(sale.total_profit || 0), 0) / 10000),
    };
  });

  // 车辆品牌分布
  const brandDistribution = vehicles.reduce((acc, vehicle) => {
    const brand = vehicle.brand;
    const existing = acc.find(item => item.name === brand);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: brand, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* 页面标题和月份筛选 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">统计分析</h1>
            <p className="text-muted-foreground mt-2">查看销售数据和业绩统计</p>
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(month => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 关键指标卡片 */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">月度销售数量</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyStats.salesCount} 台</div>
              <p className="text-xs text-muted-foreground mt-1">
                库存周转率 {inventoryStats.total > 0 ? ((monthlyStats.salesCount / inventoryStats.total) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">月度销售额</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{monthlyStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                平均售价 ¥{Math.round(monthlyStats.averagePrice).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">月度利润</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{monthlyStats.totalProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                利润率 {monthlyStats.totalRevenue > 0 ? ((monthlyStats.totalProfit / monthlyStats.totalRevenue) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">车辆库存</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryStats.inStock} 台</div>
              <p className="text-xs text-muted-foreground mt-1">
                已售 {inventoryStats.sold} 台 / 总计 {inventoryStats.total} 台
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 销售趋势图表 */}
        <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">销售趋势（最近6个月）</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="销售数量" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">销售额与利润趋势（万元）</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="销售额" fill="hsl(var(--primary))" />
                  <Bar dataKey="利润" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 车辆品牌分布和员工排行 */}
        <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>车辆品牌分布</CardTitle>
            </CardHeader>
            <CardContent>
              {brandDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={brandDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {brandDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  暂无车辆数据
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>员工销售排行（本月）</CardTitle>
            </CardHeader>
            <CardContent>
              {employeeRanking.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>排名</TableHead>
                        <TableHead>员工</TableHead>
                        <TableHead className="text-right">销售数量</TableHead>
                        <TableHead className="text-right">实现利润</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeeRanking.slice(0, 5).map((item, index) => (
                        <TableRow key={item.profile.id}>
                          <TableCell>
                            {index === 0 ? (
                              <Award className="h-5 w-5 text-primary" />
                            ) : (
                              <span className="font-medium">{index + 1}</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.profile.username || item.profile.email}
                          </TableCell>
                          <TableCell className="text-right">{item.salesCount} 台</TableCell>
                          <TableCell className="text-right font-medium">
                            ¥{item.totalProfit.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  本月暂无销售记录
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
