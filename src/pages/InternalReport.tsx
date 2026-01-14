import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { vehicleSalesApi, profilesApi } from '@/db/api';
import { VehicleSale, Profile } from '@/types/types';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Trophy, Users, Target, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function InternalReport() {
  const [loading, setLoading] = useState(true);
  const [dailySales, setDailySales] = useState<VehicleSale[]>([]);
  const [monthlySales, setMonthlySales] = useState<VehicleSale[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 获取今日销售数据
      const today = new Date().toISOString().split('T')[0];
      const allSales = await vehicleSalesApi.getAll();
      const todaySales = allSales.filter(sale => sale.sale_date === today);
      setDailySales(todaySales);

      // 获取当月销售数据
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth() + 1;
      const monthSales = await vehicleSalesApi.getByMonth(year, month);
      setMonthlySales(monthSales);

      // 获取员工数据
      const employeeData = await profilesApi.getAll();
      setEmployees(employeeData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 计算每日统计数据
  const dailyStats = {
    count: dailySales.length,
    totalAmount: dailySales.reduce((sum, sale) => sum + Number(sale.sale_price), 0),
    totalProfit: dailySales.reduce((sum, sale) => sum + Number(sale.total_profit), 0),
    avgPrice: dailySales.length > 0 
      ? dailySales.reduce((sum, sale) => sum + Number(sale.sale_price), 0) / dailySales.length 
      : 0,
  };

  // 计算月度统计数据
  const monthlyStats = {
    count: monthlySales.length,
    totalAmount: monthlySales.reduce((sum, sale) => sum + Number(sale.sale_price), 0),
    totalProfit: monthlySales.reduce((sum, sale) => sum + Number(sale.total_profit), 0),
    avgPrice: monthlySales.length > 0 
      ? monthlySales.reduce((sum, sale) => sum + Number(sale.sale_price), 0) / monthlySales.length 
      : 0,
  };

  // 计算员工销售排行
  const employeeRanking = employees.map(emp => {
    const empSales = monthlySales.filter(sale => sale.sales_employee_id === emp.id);
    return {
      employee: emp,
      count: empSales.length,
      totalAmount: empSales.reduce((sum, sale) => sum + Number(sale.sale_price), 0),
      totalProfit: empSales.reduce((sum, sale) => sum + Number(sale.total_profit), 0),
    };
  }).filter(item => item.count > 0)
    .sort((a, b) => b.totalProfit - a.totalProfit);

  // 计算奖金池（月度总利润的10%）
  const bonusPool = monthlyStats.totalProfit * 0.1;
  const champion = employeeRanking.length > 0 ? employeeRanking[0] : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 bg-muted" />
        <Skeleton className="h-96 bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">内部通报</h1>
        <p className="text-muted-foreground mt-2">查看每日和月度销售通报</p>
      </div>

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList>
          <TabsTrigger value="daily">每日通报</TabsTrigger>
          <TabsTrigger value="monthly">月度通报</TabsTrigger>
        </TabsList>

        {/* 每日通报 */}
        <TabsContent value="daily" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今日销售数量</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dailyStats.count} 辆</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dailyStats.count > 0 ? '销售进行中' : '暂无销售'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今日销售额</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{dailyStats.totalAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  平均 ¥{Math.round(dailyStats.avgPrice).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今日利润</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{dailyStats.totalProfit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dailyStats.count > 0 ? `平均 ¥${Math.round(dailyStats.totalProfit / dailyStats.count).toLocaleString()}` : '暂无数据'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">完成率</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dailyStats.count > 0 ? '100%' : '0%'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dailyStats.count > 0 ? '目标达成' : '继续努力'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 今日销售明细 */}
          <Card>
            <CardHeader>
              <CardTitle>今日销售明细</CardTitle>
            </CardHeader>
            <CardContent>
              {dailySales.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  今日暂无销售记录
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>车辆</TableHead>
                      <TableHead>客户</TableHead>
                      <TableHead>成交价</TableHead>
                      <TableHead>利润</TableHead>
                      <TableHead>销售员</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailySales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          {sale.vehicle?.brand} {sale.vehicle?.model}
                        </TableCell>
                        <TableCell>{sale.customer_name}</TableCell>
                        <TableCell>¥{Number(sale.sale_price).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={Number(sale.total_profit) > 0 ? 'default' : 'secondary'}>
                            ¥{Number(sale.total_profit).toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sale.sales_employee?.username || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 月度通报 */}
        <TabsContent value="monthly" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">本月销售数量</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyStats.count} 辆</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedMonth.getFullYear()}年{selectedMonth.getMonth() + 1}月
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">本月销售额</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{monthlyStats.totalAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  平均 ¥{Math.round(monthlyStats.avgPrice).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">本月总利润</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{monthlyStats.totalProfit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {monthlyStats.count > 0 ? `平均 ¥${Math.round(monthlyStats.totalProfit / monthlyStats.count).toLocaleString()}` : '暂无数据'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">奖金池</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{Math.round(bonusPool).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  总利润的 10%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 销售冠军 */}
          {champion && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  本月销售冠军
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{champion.employee.username}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {champion.employee.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">销售业绩</p>
                    <p className="text-xl font-bold">{champion.count} 辆</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      利润 ¥{champion.totalProfit.toLocaleString()}
                    </p>
                    <Badge className="mt-2">奖金 ¥{Math.round(bonusPool).toLocaleString()}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 员工销售排行 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                员工销售排行
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employeeRanking.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  本月暂无销售记录
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">排名</TableHead>
                      <TableHead>员工</TableHead>
                      <TableHead>销售数量</TableHead>
                      <TableHead>销售额</TableHead>
                      <TableHead>实现利润</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeRanking.map((item, index) => (
                      <TableRow key={item.employee.id}>
                        <TableCell>
                          {index === 0 && <Trophy className="h-5 w-5 text-primary inline" />}
                          {index === 1 && <Trophy className="h-5 w-5 text-muted-foreground inline" />}
                          {index === 2 && <Trophy className="h-5 w-5 text-orange-500 inline" />}
                          {index > 2 && <span className="text-muted-foreground">#{index + 1}</span>}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.employee.username}
                        </TableCell>
                        <TableCell>{item.count} 辆</TableCell>
                        <TableCell>¥{item.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={item.totalProfit > 0 ? 'default' : 'secondary'}>
                            ¥{item.totalProfit.toLocaleString()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* 月度销售明细 */}
          <Card>
            <CardHeader>
              <CardTitle>本月销售明细</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlySales.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  本月暂无销售记录
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>日期</TableHead>
                        <TableHead>车辆</TableHead>
                        <TableHead>客户</TableHead>
                        <TableHead>成交价</TableHead>
                        <TableHead>利润</TableHead>
                        <TableHead>销售员</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlySales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.sale_date}</TableCell>
                          <TableCell className="font-medium">
                            {sale.vehicle?.brand} {sale.vehicle?.model}
                          </TableCell>
                          <TableCell>{sale.customer_name}</TableCell>
                          <TableCell>¥{Number(sale.sale_price).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={Number(sale.total_profit) > 0 ? 'default' : 'secondary'}>
                              ¥{Number(sale.total_profit).toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {sale.sales_employee?.username || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
