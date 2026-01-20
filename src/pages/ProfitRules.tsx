import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { profitRulesApi, getCurrentDealershipId, profilesApi, dealershipsApi } from '@/db/api';
import type { ProfitRule, Profile } from '@/types/types';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProfitRules() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentRule, setCurrentRule] = useState<ProfitRule | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [rentInvestorIds, setRentInvestorIds] = useState<string[]>([]);
  const [displayContactName, setDisplayContactName] = useState('');
  const [displayContactPhone, setDisplayContactPhone] = useState('');
  
  const [formData, setFormData] = useState({
    rent_investor_rate: 18,
    bonus_pool_rate: 10,
    salesperson_rate: 36,
    investor_rate: 36,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const dealershipId = await getCurrentDealershipId();
      
      // 加载提成规则
      const rule = await profitRulesApi.getActive();
      if (rule) {
        setCurrentRule(rule);
        setFormData({
          rent_investor_rate: rule.rent_investor_rate,
          bonus_pool_rate: rule.bonus_pool_rate,
          salesperson_rate: rule.salesperson_rate,
          investor_rate: rule.investor_rate,
        });
      }
      
      // 加载员工列表
      const profilesList = await profilesApi.getByDealership(dealershipId);
      setProfiles(profilesList);
      
      // 加载当前车行的配置
      const dealership = await dealershipsApi.getById(dealershipId);
      if (dealership) {
        if (dealership.rent_investor_ids) {
          setRentInvestorIds(dealership.rent_investor_ids);
        }
        // 加载公共展示联系人信息
        setDisplayContactName(dealership.display_contact_name || '');
        setDisplayContactPhone(dealership.display_contact_phone || '');
      }
    } catch (error) {
      console.error('加载提成规则失败:', error);
      toast.error('加载提成规则失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('只有管理员可以修改提成规则');
      return;
    }

    // 验证总计是否为100%
    const total = 
      Number(formData.rent_investor_rate) +
      Number(formData.bonus_pool_rate) +
      Number(formData.salesperson_rate) +
      Number(formData.investor_rate);

    if (Math.abs(total - 100) > 0.01) {
      toast.error(`总计必须为100%，当前为${total.toFixed(2)}%`);
      return;
    }

    try {
      setSaving(true);
      const dealershipId = await getCurrentDealershipId();
      
      // 保存提成规则
      if (currentRule) {
        // 更新现有规则
        await profitRulesApi.update(currentRule.id, formData);
      } else {
        // 创建新规则
        await profitRulesApi.create({
          ...formData,
          dealership_id: dealershipId,
          is_active: true,
        });
      }
      
      // 保存场地老板配置和公共展示联系人信息
      await dealershipsApi.update(dealershipId, {
        rent_investor_ids: rentInvestorIds,
        display_contact_name: displayContactName || undefined,
        display_contact_phone: displayContactPhone || undefined,
      });
      
      toast.success('提成规则已更新，所有利润计算将使用新规则');
      loadData();
    } catch (error: any) {
      console.error('保存提成规则失败:', error);
      toast.error(error.message || '保存提成规则失败');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleRentInvestorToggle = (profileId: string) => {
    setRentInvestorIds(prev => {
      if (prev.includes(profileId)) {
        return prev.filter(id => id !== profileId);
      } else {
        return [...prev, profileId];
      }
    });
  };

  const calculateTotal = () => {
    return (
      Number(formData.rent_investor_rate) +
      Number(formData.bonus_pool_rate) +
      Number(formData.salesperson_rate) +
      Number(formData.investor_rate)
    ).toFixed(2);
  };

  const isValidTotal = () => {
    const total = Number(calculateTotal());
    return Math.abs(total - 100) < 0.01;
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-4 sm:space-y-6">
          <Skeleton className="h-10 w-48 bg-muted" />
          <Skeleton className="h-96 bg-muted" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">提成规则设置</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              配置利润分配比例，总计必须为100%
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Settings className="h-5 w-5" />
            <span className="text-sm">管理员专用</span>
          </div>
        </div>

        {!isAdmin && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              您没有权限修改提成规则。只有管理员可以调整利润分配比例。
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>当前提成规则</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 场地老板 */}
              <div className="space-y-2">
                <Label htmlFor="rent_investor_rate" className="text-sm sm:text-base">
                  场地老板分成比例 (%)
                </Label>
                <Input
                  id="rent_investor_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.rent_investor_rate}
                  onChange={(e) => handleInputChange('rent_investor_rate', e.target.value)}
                  disabled={!isAdmin}
                  className="h-11 sm:h-10"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  场地老板从每笔交易利润中获得的分成比例
                </p>
              </div>

              {/* 月奖金池 */}
              <div className="space-y-2">
                <Label htmlFor="bonus_pool_rate" className="text-sm sm:text-base">
                  月奖金池分成比例 (%)
                </Label>
                <Input
                  id="bonus_pool_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.bonus_pool_rate}
                  onChange={(e) => handleInputChange('bonus_pool_rate', e.target.value)}
                  disabled={!isAdmin}
                  className="h-11 sm:h-10"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  进入月奖金池的比例，仅用于统计
                </p>
              </div>

              {/* 销售提成 */}
              <div className="space-y-2">
                <Label htmlFor="salesperson_rate" className="text-sm sm:text-base">
                  销售提成比例 (%)
                </Label>
                <Input
                  id="salesperson_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.salesperson_rate}
                  onChange={(e) => handleInputChange('salesperson_rate', e.target.value)}
                  disabled={!isAdmin}
                  className="h-11 sm:h-10"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  销售员从每笔交易利润中获得的提成比例
                </p>
              </div>

              {/* 押车出资人 */}
              <div className="space-y-2">
                <Label htmlFor="investor_rate" className="text-sm sm:text-base">
                  押车出资人分成比例 (%)
                </Label>
                <Input
                  id="investor_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.investor_rate}
                  onChange={(e) => handleInputChange('investor_rate', e.target.value)}
                  disabled={!isAdmin}
                  className="h-11 sm:h-10"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  押车出资人从每笔交易利润中获得的分成比例
                </p>
              </div>

              {/* 场地老板选择 */}
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-sm sm:text-base">
                  场地老板（从员工中选择）
                </Label>
                <p className="text-xs text-muted-foreground">
                  选择担任场地老板角色的员工，可多选。场地老板将按上述比例分配利润。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-3 border rounded-lg bg-muted/30">
                  {profiles.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                      暂无员工，请先添加员工
                    </p>
                  ) : (
                    profiles.map((p) => (
                      <div key={p.id} className="flex items-center space-x-2 p-2 rounded hover:bg-background">
                        <Checkbox
                          id={`rent-investor-${p.id}`}
                          checked={rentInvestorIds.includes(p.id)}
                          onCheckedChange={() => handleRentInvestorToggle(p.id)}
                          disabled={!isAdmin}
                        />
                        <label
                          htmlFor={`rent-investor-${p.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {p.username}
                          {p.role === 'admin' && (
                            <span className="ml-2 text-xs text-primary">(管理员)</span>
                          )}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                {rentInvestorIds.length > 0 && (
                  <p className="text-xs text-primary">
                    已选择 {rentInvestorIds.length} 位场地老板
                  </p>
                )}
              </div>

              {/* 公共展示联系人信息 */}
              <div className="space-y-3 pt-4 border-t">
                <div>
                  <Label className="text-sm sm:text-base">
                    公共展示联系人信息
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    设置在公共车辆展示页面显示的联系方式。如果不设置，将默认显示当前登录人的名字和电话。
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_contact_name" className="text-sm">
                      联系人名称
                    </Label>
                    <Input
                      id="display_contact_name"
                      type="text"
                      placeholder={`留空则显示：${profile?.username || '当前登录人名字'}`}
                      value={displayContactName}
                      onChange={(e) => setDisplayContactName(e.target.value)}
                      disabled={!isAdmin}
                      className="h-11 sm:h-10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="display_contact_phone" className="text-sm">
                      联系电话
                    </Label>
                    <Input
                      id="display_contact_phone"
                      type="tel"
                      placeholder={`留空则显示：${profile?.phone || '当前登录人电话'}`}
                      value={displayContactPhone}
                      onChange={(e) => setDisplayContactPhone(e.target.value)}
                      disabled={!isAdmin}
                      className="h-11 sm:h-10"
                    />
                  </div>
                </div>
                
                {(displayContactName || displayContactPhone) && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-xs text-primary font-medium">
                      ✓ 公共展示页面将显示：
                      {displayContactName && ` ${displayContactName}`}
                      {displayContactPhone && ` ${displayContactPhone}`}
                    </p>
                  </div>
                )}
              </div>

              {/* 总计显示 */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-base sm:text-lg font-medium">总计：</span>
                  <span className={`text-xl sm:text-2xl font-bold ${
                    isValidTotal() ? 'text-green-600' : 'text-destructive'
                  }`}>
                    {calculateTotal()}%
                  </span>
                </div>
                {!isValidTotal() && (
                  <p className="text-sm text-destructive mt-2">
                    ⚠️ 总计必须等于100%才能保存
                  </p>
                )}
              </div>

              {/* 保存按钮 */}
              {isAdmin && (
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={!isValidTotal() || saving}
                    className="h-11 sm:h-10 w-full sm:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? '保存中...' : '保存规则'}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* 说明卡片 */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <p className="font-medium text-primary">💡 关于提成规则</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>提成规则调整后，所有新的利润计算将使用新规则</li>
                <li>历史数据的利润分配不会自动更新</li>
                <li>四个角色的分成比例总和必须等于100%</li>
                <li>建议在月初调整规则，避免月中调整造成混乱</li>
                <li>每次调整都会创建新的规则记录，保留历史记录</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
