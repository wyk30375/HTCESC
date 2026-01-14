import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, Users, DollarSign, Car, ShoppingCart } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

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

export default function PlatformStatistics() {
  const [loading, setLoading] = useState(true);
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
  }, []);

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
        .from('sales')
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
          .from('sales')
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

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

      {/* 销售趋势（占位符） */}
      <Card>
        <CardHeader>
          <CardTitle>平台销售趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>销售趋势图表功能开发中...</p>
            <p className="text-sm mt-2">将展示月度销售趋势、同比增长等数据</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
