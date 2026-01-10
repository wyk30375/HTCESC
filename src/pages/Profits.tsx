import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { vehicleSalesApi, vehiclesApi, vehicleCostsApi, profilesApi } from '@/db/api';
import type { VehicleSale, Vehicle, Profile } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { TrendingUp, Users, Wallet, Award } from 'lucide-react';

interface ProfitDetail {
  sale: VehicleSale;
  vehicle: Vehicle;
  totalCost: number;
  totalProfit: number;
  salespersonShare: number;
  investorShare: number;
  rentInvestorShare: number;
  bonusPoolShare: number;
  salesperson?: Profile;
  investors: Profile[];
  rentInvestors: Profile[];
}

export default function Profits() {
  const [profitDetails, setProfitDetails] = useState<ProfitDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 加载所有用户资料
      const profilesData = await profilesApi.getAll();
      setProfiles(profilesData);
      
      // 加载销售记录
      const salesData = await vehicleSalesApi.getAll();
      
      // 按月份筛选
      const filteredSales = salesData.filter(sale => 
        sale.sale_date.startsWith(selectedMonth)
      );
      
      // 加载车辆信息
      const vehiclesData = await vehiclesApi.getAll();
      
      // 计算每台车的利润分配
      const details: ProfitDetail[] = [];
      
      for (const sale of filteredSales) {
        const vehicle = vehiclesData.find(v => v.id === sale.vehicle_id);
        if (!vehicle) continue;
        
        // 获取车辆成本
        const costs = await vehicleCostsApi.getByVehicleId(sale.vehicle_id);
        const totalCost = costs.reduce((sum, cost) => sum + Number(cost.amount), 0)
          + Number(sale.sale_preparation_cost || 0)
          + Number(sale.sale_transfer_cost || 0)
          + Number(sale.sale_misc_cost || 0);
        
        // 计算总利润：成交价 - 总成本 + 贷款返利
        const totalProfit = Number(sale.sale_price) - totalCost + Number(sale.loan_rebate || 0);
        
        // 利润分配
        const salespersonShare = totalProfit * 0.36; // 销售提成 36%
        const investorShare = totalProfit * 0.36; // 押车出资人 36%
        const rentInvestorShare = totalProfit * 0.18; // 地租 18%
        const bonusPoolShare = totalProfit * 0.10; // 月奖金池 10%
        
        // 获取相关人员信息
        const salesperson = profilesData.find(p => p.id === sale.salesperson_id);
        
        // 调试信息
        if (!salesperson && sale.salesperson_id) {
          console.warn('未找到销售员:', {
            salesperson_id: sale.salesperson_id,
            available_profiles: profilesData.map(p => ({ id: p.id, name: p.username || p.email })),
          });
        }
        
        // 从 vehicle 表读取 investor_ids 和 rent_investor_ids
        let investorIds: string[] = [];
        let rentInvestorIds: string[] = [];
        
        try {
          if (vehicle.investor_ids) {
            investorIds = typeof vehicle.investor_ids === 'string' 
              ? JSON.parse(vehicle.investor_ids) 
              : vehicle.investor_ids;
          }
          if (vehicle.rent_investor_ids) {
            rentInvestorIds = typeof vehicle.rent_investor_ids === 'string'
              ? JSON.parse(vehicle.rent_investor_ids)
              : vehicle.rent_investor_ids;
          }
        } catch (error) {
          console.error('解析角色ID失败:', error);
        }
        
        const investors = profilesData.filter(p => investorIds.includes(p.id));
        const rentInvestors = profilesData.filter(p => rentInvestorIds.includes(p.id));
        
        details.push({
          sale,
          vehicle,
          totalCost,
          totalProfit,
          salespersonShare,
          investorShare,
          rentInvestorShare,
          bonusPoolShare,
          salesperson,
          investors,
          rentInvestors,
        });
      }
      
      setProfitDetails(details);
    } catch (error) {
      console.error('加载利润分配数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 计算月度汇总
  const monthlyTotalProfit = profitDetails.reduce((sum, detail) => sum + detail.totalProfit, 0);
  const monthlyTotalSalespersonShare = profitDetails.reduce((sum, detail) => sum + detail.salespersonShare, 0);
  const monthlyTotalInvestorShare = profitDetails.reduce((sum, detail) => sum + detail.investorShare, 0);
  const monthlyTotalRentInvestorShare = profitDetails.reduce((sum, detail) => sum + detail.rentInvestorShare, 0);
  const monthlyTotalBonusPool = profitDetails.reduce((sum, detail) => sum + detail.bonusPoolShare, 0);

  // 生成月份选项（最近12个月）
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().slice(0, 7);
  });

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48 bg-muted" />
          <div className="grid gap-4 @md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 bg-muted" />
            ))}
          </div>
          <Skeleton className="h-96 bg-muted" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 @md:flex-row @md:items-center @md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">利润分配</h1>
            <p className="text-muted-foreground mt-2">查看和管理利润分配记录</p>
          </div>
          
          <div className="w-full @md:w-48">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="选择月份" />
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
        </div>

        {/* 月度汇总卡片 */}
        <div className="grid gap-4 @md:grid-cols-2 @xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总利润</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{monthlyTotalProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {profitDetails.length} 台车辆
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">销售提成 (36%)</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{monthlyTotalSalespersonShare.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                销售员提成总额
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">押车出资 (36%)</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{monthlyTotalInvestorShare.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                出资人分配总额
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">月奖金池 (10%)</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{monthlyTotalBonusPool.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                地租: ¥{monthlyTotalRentInvestorShare.toLocaleString()} (18%)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 利润分配明细表 */}
        <Card>
          <CardHeader>
            <CardTitle>利润分配明细</CardTitle>
          </CardHeader>
          <CardContent>
            {profitDetails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                本月暂无销售记录
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>车辆信息</TableHead>
                      <TableHead>销售日期</TableHead>
                      <TableHead className="text-right">成交价</TableHead>
                      <TableHead className="text-right">总成本</TableHead>
                      <TableHead className="text-right">总利润</TableHead>
                      <TableHead>销售员</TableHead>
                      <TableHead>押车出资人</TableHead>
                      <TableHead>地租出资人</TableHead>
                      <TableHead className="text-right">奖金池</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profitDetails.map((detail) => (
                      <TableRow key={detail.sale.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{detail.vehicle.brand} {detail.vehicle.model}</div>
                            <div className="text-xs text-muted-foreground">
                              {detail.vehicle.vin_last_six}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{detail.sale.sale_date}</TableCell>
                        <TableCell className="text-right">
                          ¥{Number(detail.sale.sale_price).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ¥{detail.totalCost.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={detail.totalProfit > 0 ? 'default' : 'destructive'}>
                            ¥{detail.totalProfit.toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {detail.salesperson?.username || detail.salesperson?.email || '未指定'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ¥{detail.salespersonShare.toLocaleString()}
                            </div>
                            {!detail.salesperson && detail.sale.salesperson_id && (
                              <div className="text-xs text-amber-600 mt-1">
                                ⚠️ ID: {detail.sale.salesperson_id.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {detail.investors.length > 0 ? (
                            <div className="space-y-1">
                              {detail.investors.map((investor, idx) => (
                                <div key={investor.id}>
                                  <div className="font-medium text-sm">
                                    {investor.username || investor.email}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    ¥{(detail.investorShare / detail.investors.length).toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">未指定</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {detail.rentInvestors.length > 0 ? (
                            <div className="space-y-1">
                              {detail.rentInvestors.map((investor, idx) => (
                                <div key={investor.id}>
                                  <div className="font-medium text-sm">
                                    {investor.username || investor.email}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    ¥{(detail.rentInvestorShare / detail.rentInvestors.length).toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">未指定</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          ¥{detail.bonusPoolShare.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 说明卡片 */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">利润分配规则</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">销售提成</Badge>
              <span>销售员获得 36% 利润</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">押车出资</Badge>
              <span>押车出资人平分 36% 利润</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">地租</Badge>
              <span>地租出资人平分 18% 利润</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">月奖金池</Badge>
              <span>10% 利润进入月奖金池，月底分配给销售冠军</span>
            </div>
            <p className="text-muted-foreground mt-2">
              💡 总利润 = 成交价 - 总成本（购车款 + 整备费 + 过户费 + 杂费）+ 贷款返利
            </p>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
