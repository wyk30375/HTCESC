import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, TrendingUp, Users, DollarSign, Car, ShoppingCart, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

interface DealershipStats {
  id: string;
  name: string;
  code: string;
  status: string;
  vehicle_count: number;
  sales_count: number;
  total_sales: number;
  total_profit: number;
}

interface MonthlyTrend {
  month: string;
  sales_count: number;
  sales_amount: number;
  profit: number;
}

type TimeRange = '3' | '6' | '12';

export default function PlatformStatistics() {
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('6');
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [stats, setStats] = useState({
    totalDealerships: 0,
    activeDealerships: 0,
    pendingDealerships: 0,
    totalUsers: 0,
    totalVehicles: 0,
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
  });
  const [dealershipStats, setDealershipStats] = useState<DealershipStats[]>([]);

  useEffect(() => {
    loadStatistics();
    loadSalesTrend();
  }, []);

  useEffect(() => {
    loadSalesTrend();
  }, [timeRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);

      // 查询车行统计
      const { data: dealerships, error: dealershipsError } = await supabase
        .from('dealerships')
        .select('id, name, code, status');

      if (dealershipsError) throw dealershipsError;

      const totalDealerships = dealerships?.length || 0;
      const activeDealerships = dealerships?.filter(d => d.status === 'active').length || 0;
      const pendingDealerships = dealerships?.filter(d => d.status === 'pending').length || 0;

      // 查询用户总数
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // 查询车辆总数
      const { count: vehiclesCount, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });

      if (vehiclesError) throw vehiclesError;

      // 查询销售总数和总金额
      const { data: salesData, error: salesError } = await supabase
        .from('vehicle_sales')
        .select('sale_price, total_profit');

      if (salesError) throw salesError;

      const totalSales = salesData?.length || 0;
      const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.sale_price || 0), 0) || 0;
      const totalProfit = salesData?.reduce((sum, sale) => sum + (sale.total_profit || 0), 0) || 0;

      // 查询各车行详细统计
      const dealershipStatsData: DealershipStats[] = [];
      
      for (const dealership of dealerships || []) {
        // 查询该车行的车辆数
        const { count: vehicleCount } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true })
          .eq('dealership_id', dealership.id);

        // 查询该车行的销售数据
        const { data: dealershipSales } = await supabase
          .from('vehicle_sales')
          .select('sale_price, total_profit')
          .eq('dealership_id', dealership.id);

        const salesCount = dealershipSales?.length || 0;
        const dealershipRevenue = dealershipSales?.reduce((sum, sale) => sum + (sale.sale_price || 0), 0) || 0;
        const dealershipProfit = dealershipSales?.reduce((sum, sale) => sum + (sale.total_profit || 0), 0) || 0;

        dealershipStatsData.push({
          id: dealership.id,
          name: dealership.name,
          code: dealership.code,
          status: dealership.status,
          vehicle_count: vehicleCount || 0,
          sales_count: salesCount,
          total_sales: dealershipRevenue,
          total_profit: dealershipProfit,
        });
      }

      // 按销售额排序
      dealershipStatsData.sort((a, b) => b.total_sales - a.total_sales);

      setStats({
        totalDealerships,
        activeDealerships,
        pendingDealerships,
        totalUsers: usersCount || 0,
        totalVehicles: vehiclesCount || 0,
        totalSales,
        totalRevenue,
        totalProfit,
      });

      setDealershipStats(dealershipStatsData);
    } catch (error) {
      console.error('加载统计数据失败:', error);
      toast.error('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadSalesTrend = async () => {
    try {
      setTrendLoading(true);

      // 计算开始日期（N个月前）
      const monthsAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsAgo);
      startDate.setDate(1); // 设置为月初
      startDate.setHours(0, 0, 0, 0);

      // 查询销售数据
      const { data: salesData, error } = await supabase
        .from('vehicle_sales')
        .select('sale_date, sale_price, total_profit')
        .gte('sale_date', startDate.toISOString())
        .order('sale_date', { ascending: true });

      if (error) throw error;

      // 按月份分组统计
      const monthlyData: { [key: string]: MonthlyTrend } = {};
      
      // 初始化所有月份
      for (let i = 0; i < monthsAgo; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (monthsAgo - 1 - i));
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = `${date.getFullYear()}年${date.getMonth() + 1}月`;
        
        monthlyData[monthKey] = {
          month: monthLabel,
          sales_count: 0,
          sales_amount: 0,
          profit: 0,
        };
      }

      // 统计销售数据
      salesData?.forEach((sale) => {
        const saleDate = new Date(sale.sale_date);
        const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].sales_count += 1;
          monthlyData[monthKey].sales_amount += sale.sale_price || 0;
          monthlyData[monthKey].profit += sale.total_profit || 0;
        }
      });

      // 转换为数组并排序
      const trendData = Object.values(monthlyData).sort((a, b) => {
        const monthA = a.month.replace(/年|月/g, '-').replace(/-$/, '');
        const monthB = b.month.replace(/年|月/g, '-').replace(/-$/, '');
        return monthA.localeCompare(monthB);
      });

      setMonthlyTrend(trendData);
    } catch (error) {
      console.error('加载销售趋势失败:', error);
      toast.error('加载销售趋势失败');
    } finally {
      setTrendLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateGrowthRate = () => {
    if (monthlyTrend.length < 2) return null;
    
    const lastMonth = monthlyTrend[monthlyTrend.length - 1];
    const previousMonth = monthlyTrend[monthlyTrend.length - 2];
    
    if (previousMonth.sales_amount === 0) return null;
    
    const rate = ((lastMonth.sales_amount - previousMonth.sales_amount) / previousMonth.sales_amount) * 100;
    return rate;
  };

  const getGrowthIcon = (rate: number | null) => {
    if (rate === null) return <Minus className="h-4 w-4" />;
    if (rate > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rate < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4" />;
  };

  const getGrowthColor = (rate: number | null) => {
    if (rate === null) return 'text-muted-foreground';
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">正常运营</Badge>;
      case 'pending':
        return <Badge variant="secondary">待审核</Badge>;
      case 'inactive':
        return <Badge variant="outline">已停用</Badge>;
      case 'rejected':
        return <Badge variant="destructive">已拒绝</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">平台统计</h1>
        <p className="text-muted-foreground mt-2">
          查看平台整体运营数据和各车行统计信息
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">车行总数</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDealerships}</div>
            <p className="text-xs text-muted-foreground">
              正常运营 {stats.activeDealerships} | 待审核 {stats.pendingDealerships}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总销售额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              总利润 {formatCurrency(stats.totalProfit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              平台注册用户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">车辆/销售</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles} / {stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              总车辆数 / 总销售数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 各车行销售数据对比 */}
      <Card>
        <CardHeader>
          <CardTitle>各车行销售数据对比</CardTitle>
        </CardHeader>
        <CardContent>
          {dealershipStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无车行数据
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>排名</TableHead>
                  <TableHead>车行名称</TableHead>
                  <TableHead>车行代码</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">车辆数</TableHead>
                  <TableHead className="text-right">销售数</TableHead>
                  <TableHead className="text-right">销售额</TableHead>
                  <TableHead className="text-right">利润</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealershipStats.map((dealership, index) => (
                  <TableRow key={dealership.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {index === 0 && <TrendingUp className="h-4 w-4 text-yellow-500" />}
                        <span className="font-medium">#{index + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{dealership.name}</TableCell>
                    <TableCell>{dealership.code}</TableCell>
                    <TableCell>{getStatusBadge(dealership.status)}</TableCell>
                    <TableCell className="text-right">{dealership.vehicle_count}</TableCell>
                    <TableCell className="text-right">{dealership.sales_count}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(dealership.total_sales)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(dealership.total_profit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 平台销售趋势 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>平台销售趋势</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={timeRange === '3' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('3')}
              >
                最近3个月
              </Button>
              <Button
                variant={timeRange === '6' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('6')}
              >
                最近6个月
              </Button>
              <Button
                variant={timeRange === '12' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('12')}
              >
                最近12个月
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">加载中...</div>
            </div>
          ) : monthlyTrend.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无销售数据</p>
              <p className="text-sm mt-2">当前时间范围内没有销售记录</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 趋势汇总 */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">总销售额</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(monthlyTrend.reduce((sum, m) => sum + m.sales_amount, 0))}
                  </p>
                  <div className="flex items-center gap-1 text-sm">
                    {getGrowthIcon(calculateGrowthRate())}
                    <span className={getGrowthColor(calculateGrowthRate())}>
                      {calculateGrowthRate() !== null
                        ? `${calculateGrowthRate()! > 0 ? '+' : ''}${calculateGrowthRate()!.toFixed(1)}%`
                        : '无数据'}
                    </span>
                    <span className="text-muted-foreground">环比上月</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">总销售数</p>
                  <p className="text-2xl font-bold">
                    {monthlyTrend.reduce((sum, m) => sum + m.sales_count, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    平均 {(monthlyTrend.reduce((sum, m) => sum + m.sales_count, 0) / monthlyTrend.length).toFixed(1)} 辆/月
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">总利润</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(monthlyTrend.reduce((sum, m) => sum + m.profit, 0))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    利润率 {monthlyTrend.reduce((sum, m) => sum + m.sales_amount, 0) > 0
                      ? ((monthlyTrend.reduce((sum, m) => sum + m.profit, 0) / monthlyTrend.reduce((sum, m) => sum + m.sales_amount, 0)) * 100).toFixed(1)
                      : '0.0'}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">平均单价</p>
                  <p className="text-2xl font-bold">
                    {monthlyTrend.reduce((sum, m) => sum + m.sales_count, 0) > 0
                      ? formatCurrency(monthlyTrend.reduce((sum, m) => sum + m.sales_amount, 0) / monthlyTrend.reduce((sum, m) => sum + m.sales_count, 0))
                      : formatCurrency(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    每辆车平均售价
                  </p>
                </div>
              </div>

              {/* 趋势图表 */}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === '销售额' || name === '利润') {
                          return [formatCurrency(value), name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="right"
                      dataKey="sales_count" 
                      name="销售数" 
                      fill="hsl(var(--primary))"
                      opacity={0.8}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="sales_amount" 
                      name="销售额" 
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-1))' }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="profit" 
                      name="利润" 
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* 月度数据表格 */}
              <div>
                <h3 className="text-sm font-medium mb-3">月度详细数据</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>月份</TableHead>
                      <TableHead className="text-right">销售数</TableHead>
                      <TableHead className="text-right">销售额</TableHead>
                      <TableHead className="text-right">利润</TableHead>
                      <TableHead className="text-right">平均单价</TableHead>
                      <TableHead className="text-right">利润率</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyTrend.map((month) => (
                      <TableRow key={month.month}>
                        <TableCell className="font-medium">{month.month}</TableCell>
                        <TableCell className="text-right">{month.sales_count}</TableCell>
                        <TableCell className="text-right">{formatCurrency(month.sales_amount)}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(month.profit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {month.sales_count > 0
                            ? formatCurrency(month.sales_amount / month.sales_count)
                            : formatCurrency(0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {month.sales_amount > 0
                            ? `${((month.profit / month.sales_amount) * 100).toFixed(1)}%`
                            : '0.0%'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
