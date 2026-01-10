import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { vehiclesApi, vehicleSalesApi, employeesApi, monthlyBonusesApi } from '@/db/api';
import { Car, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    inStockVehicles: 0,
    soldVehicles: 0,
    totalEmployees: 0,
    monthSales: 0,
    monthRevenue: 0,
    monthProfit: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 获取车辆统计
      const [allVehicles, inStockVehicles, soldVehicles] = await Promise.all([
        vehiclesApi.getAll(),
        vehiclesApi.getInStock(),
        vehiclesApi.getSold(),
      ]);

      // 获取员工统计
      const employees = await employeesApi.getActive();

      // 获取本月销售统计
      const now = new Date();
      const monthSales = await vehicleSalesApi.getByMonth(now.getFullYear(), now.getMonth() + 1);
      
      const monthRevenue = monthSales.reduce((sum, sale) => sum + Number(sale.sale_price), 0);
      const monthProfit = monthSales.reduce((sum, sale) => sum + Number(sale.total_profit), 0);

      setStats({
        totalVehicles: allVehicles.length,
        inStockVehicles: inStockVehicles.length,
        soldVehicles: soldVehicles.length,
        totalEmployees: employees.length,
        monthSales: monthSales.length,
        monthRevenue,
        monthProfit,
      });
    } catch (error) {
      console.error('加载仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 bg-muted" />
          <Skeleton className="mt-2 h-4 w-96 bg-muted" />
        </div>
        <div className="grid gap-4 @md:grid-cols-2 @xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题区域 - 使用渐变背景 */}
      <div className="page-header-bg rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">仪表盘</h1>
        <p className="text-white/90 mt-2">
          欢迎回来，查看您的业务概况
        </p>
      </div>

      {/* 统计卡片 - 使用不同颜色的渐变背景 */}
      <div className="grid gap-4 @md:grid-cols-2 @xl:grid-cols-4">
        <Card className="stat-card-blue border-2 shadow-md hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">在售车辆</CardTitle>
            <Car className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.inStockVehicles}</div>
            <p className="text-xs text-blue-600 mt-1">
              总计 {stats.totalVehicles} 辆车
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card-orange border-2 shadow-md hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">本月销售</CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{stats.monthSales}</div>
            <p className="text-xs text-orange-600 mt-1">
              已售 {stats.soldVehicles} 辆车
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card-green border-2 shadow-md hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">本月营收</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              ¥{stats.monthRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 mt-1">
              利润 ¥{stats.monthProfit.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card-purple border-2 shadow-md hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">活跃员工</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{stats.totalEmployees}</div>
            <p className="text-xs text-purple-600 mt-1">
              在职员工数量
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 @md:grid-cols-2">
        <Card className="glass-effect shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary">快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/vehicles"
              className="block rounded-lg border-2 border-primary/20 p-4 hover:bg-primary/5 hover:border-primary/40 transition-all"
            >
              <h3 className="font-semibold">车辆入库</h3>
              <p className="text-sm text-muted-foreground">添加新车辆到库存</p>
            </a>
            <a
              href="/sales"
              className="block rounded-lg border-2 border-primary/20 p-4 hover:bg-primary/5 hover:border-primary/40 transition-all"
            >
              <h3 className="font-semibold">记录销售</h3>
              <p className="text-sm text-muted-foreground">登记车辆销售信息</p>
            </a>
            <a
              href="/employees"
              className="block rounded-lg border-2 border-primary/20 p-4 hover:bg-primary/5 hover:border-primary/40 transition-all"
            >
              <h3 className="font-semibold">员工管理</h3>
              <p className="text-sm text-muted-foreground">管理员工信息和角色</p>
            </a>
          </CardContent>
        </Card>

        <Card className="glass-effect shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary">系统提示</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 p-4">
              <p className="text-sm text-blue-900">
                💡 <strong>提示：</strong>定期检查车辆状态，及时更新库存信息
              </p>
            </div>
            <div className="rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 p-4">
              <p className="text-sm text-orange-900">
                📊 <strong>数据：</strong>本月销售数据可在统计分析页面查看详情
              </p>
            </div>
            <div className="rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 p-4">
              <p className="text-sm text-purple-900">
                👥 <strong>团队：</strong>合理分配员工角色，优化利润分配
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
