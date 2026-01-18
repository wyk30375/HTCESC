import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  getMembershipTiers,
  getCurrentMembership,
  checkMembershipStatus,
  getPaymentHistory
} from '@/db/membershipApi';
import type { MembershipTier, MembershipPayment } from '@/types/types';
import { Crown, Calendar, Car, AlertCircle, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function MembershipCenter() {
  const { profile } = useAuth();
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [membershipStatus, setMembershipStatus] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<MembershipPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile?.dealership_id) return;

    try {
      setLoading(true);
      const [tiersData, statusData, paymentsData] = await Promise.all([
        getMembershipTiers(),
        checkMembershipStatus(profile.dealership_id),
        getPaymentHistory(profile.dealership_id)
      ]);

      setTiers(tiersData);
      setMembershipStatus(statusData);
      setPaymentHistory(paymentsData);
    } catch (error) {
      console.error('加载会员信息失败:', error);
      toast.error('加载会员信息失败');
    } finally {
      setLoading(false);
    }
  };

  const getTierBadgeColor = (tierLevel: number) => {
    switch (tierLevel) {
      case 0: return 'bg-yellow-500 text-white'; // 金牌
      case 1: return 'bg-blue-500 text-white'; // 一级
      case 2: return 'bg-green-500 text-white'; // 二级
      case 3: return 'bg-gray-500 text-white'; // 三级
      default: return 'bg-gray-400 text-white';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getStatusBadge = () => {
    if (!membershipStatus) return null;

    if (membershipStatus.isTrial) {
      return (
        <Badge className="bg-blue-500 text-white">
          <Clock className="w-3 h-3 mr-1" />
          免费期
        </Badge>
      );
    }

    if (membershipStatus.isExpired) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          已到期
        </Badge>
      );
    }

    if (membershipStatus.isActive) {
      return (
        <Badge className="bg-green-500 text-white">
          <CheckCircle className="w-3 h-3 mr-1" />
          正常
        </Badge>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">会员中心</h1>
        <p className="text-muted-foreground mt-2">管理您的会员信息和续费</p>
      </div>

      {/* 当前会员状态 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                当前会员状态
              </CardTitle>
              <CardDescription>您的会员等级和有效期信息</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {membershipStatus?.currentTier ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">会员等级</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getTierBadgeColor(membershipStatus.currentTier.tier_level)}>
                      {membershipStatus.currentTier.tier_name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ¥{membershipStatus.currentTier.annual_fee}/年
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Car className="w-4 h-4" />
                    在售车辆数量
                  </p>
                  <p className="text-2xl font-bold">{membershipStatus.vehicleCount} 台</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {membershipStatus.isTrial ? '免费期剩余' : '会员剩余'}
                  </p>
                  <p className="text-2xl font-bold">
                    {membershipStatus.daysUntilExpiry !== null
                      ? `${membershipStatus.daysUntilExpiry} 天`
                      : '-'}
                  </p>
                </div>
              </div>

              {/* 到期提醒 */}
              {membershipStatus.daysUntilExpiry !== null && membershipStatus.daysUntilExpiry <= 30 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {membershipStatus.isTrial
                      ? `您的免费期还有 ${membershipStatus.daysUntilExpiry} 天到期，请及时续费以继续使用服务。`
                      : `您的会员还有 ${membershipStatus.daysUntilExpiry} 天到期，请及时续费。`}
                  </AlertDescription>
                </Alert>
              )}

              {/* 等级变化提示 */}
              {membershipStatus.suggestedTier &&
                membershipStatus.suggestedTier.id !== membershipStatus.currentTier.id && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      根据您当前的在售车辆数量（{membershipStatus.vehicleCount}台），建议升级到
                      <strong className="mx-1">{membershipStatus.suggestedTier.tier_name}</strong>
                      （¥{membershipStatus.suggestedTier.annual_fee}/年）
                    </AlertDescription>
                  </Alert>
                )}
            </>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                您还没有会员信息，请联系管理员初始化会员。
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 会员等级说明 */}
      <Card>
        <CardHeader>
          <CardTitle>会员等级说明</CardTitle>
          <CardDescription>根据在售车辆数量自动判定会员等级</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <Card
                key={tier.id}
                className={
                  membershipStatus?.currentTier?.id === tier.id
                    ? 'border-primary shadow-md'
                    : ''
                }
              >
                <CardHeader className="pb-3">
                  <Badge className={getTierBadgeColor(tier.tier_level)}>
                    {tier.tier_name}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      ¥{tier.annual_fee}
                    </p>
                    <p className="text-sm text-muted-foreground">每年</p>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">车辆数量范围</p>
                    <p className="text-sm text-muted-foreground">
                      {tier.min_vehicles}
                      {tier.max_vehicles ? ` - ${tier.max_vehicles}` : '+'}台
                    </p>
                  </div>
                  {tier.description && (
                    <p className="text-xs text-muted-foreground">{tier.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 续费按钮 */}
      {membershipStatus?.isActive && (
        <Card>
          <CardHeader>
            <CardTitle>续费会员</CardTitle>
            <CardDescription>选择会员等级进行续费</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                续费功能正在开发中，请联系客服进行续费操作。
              </AlertDescription>
            </Alert>
            <Button disabled>
              <CreditCard className="w-4 h-4 mr-2" />
              立即续费
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 支付历史 */}
      {paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>支付历史</CardTitle>
            <CardDescription>查看您的会员支付记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      会员续费 - {payment.membership?.tier?.tier_name || '未知等级'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(payment.created_at)}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-bold">¥{payment.amount}</p>
                    <Badge
                      variant={
                        payment.payment_status === 'completed'
                          ? 'default'
                          : payment.payment_status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {payment.payment_status === 'completed'
                        ? '已支付'
                        : payment.payment_status === 'pending'
                          ? '待支付'
                          : payment.payment_status === 'failed'
                            ? '支付失败'
                            : '已退款'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 会员权益说明 */}
      <Card>
        <CardHeader>
          <CardTitle>会员权益</CardTitle>
          <CardDescription>成为会员后您将享受以下权益</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span>完整的车辆管理功能，支持车辆入库、销售、统计等</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span>员工管理和角色分配，支持多人协作</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span>销售数据统计和利润分配计算</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span>公共展示页面，客户可查看在售车辆</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span>数据安全保障和定期备份</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span>技术支持和系统更新</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* 免费期说明 */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            免费期说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 dark:text-blue-200">
          <p>
            新入驻的车商享有<strong>6个月免费期</strong>，免费期内可以免费使用所有功能。
            免费期结束后，需要根据在售车辆数量选择相应的会员等级进行续费。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
