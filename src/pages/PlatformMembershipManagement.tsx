import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  getAllDealershipMemberships,
  getMembershipTiers,
  renewMembership,
  updatePaymentStatus,
  updateMembership
} from '@/db/membershipApi';
import type { DealershipMembership, MembershipTier } from '@/types/types';
import { Crown, Calendar, AlertCircle, CheckCircle, Clock, CreditCard, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PlatformMembershipManagement() {
  const { profile } = useAuth();
  const [memberships, setMemberships] = useState<DealershipMembership[]>([]);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<DealershipMembership | null>(null);
  const [renewForm, setRenewForm] = useState({
    tierId: '',
    paymentMethod: '线下支付',
    transactionId: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membershipsData, tiersData] = await Promise.all([
        getAllDealershipMemberships(),
        getMembershipTiers()
      ]);
      setMemberships(membershipsData);
      setTiers(tiersData);
    } catch (error) {
      console.error('加载会员数据失败:', error);
      toast.error('加载会员数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRenewDialog = (membership: DealershipMembership) => {
    setSelectedMembership(membership);
    setRenewForm({
      tierId: membership.tier_id,
      paymentMethod: '线下支付',
      transactionId: '',
      notes: ''
    });
    setRenewDialogOpen(true);
  };

  const handleRenew = async () => {
    if (!selectedMembership?.dealership_id || !renewForm.tierId) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      // 创建新的会员记录和支付记录
      const result = await renewMembership(
        selectedMembership.dealership_id,
        renewForm.tierId,
        renewForm.paymentMethod
      );

      // 更新支付状态为已完成
      await updatePaymentStatus(
        result.paymentId,
        'completed',
        renewForm.transactionId
      );

      toast.success('续费成功');
      setRenewDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('续费失败:', error);
      toast.error('续费失败');
    }
  };

  const getTierBadgeColor = (tierLevel: number) => {
    switch (tierLevel) {
      case 0: return 'bg-yellow-500 text-white';
      case 1: return 'bg-blue-500 text-white';
      case 2: return 'bg-green-500 text-white';
      case 3: return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getStatusBadge = (membership: DealershipMembership) => {
    const now = new Date();
    const endDate = membership.end_date ? new Date(membership.end_date) : null;
    const trialEndDate = membership.trial_end_date ? new Date(membership.trial_end_date) : null;

    if (membership.is_trial && trialEndDate && now <= trialEndDate) {
      return <Badge className="bg-blue-500 text-white"><Clock className="w-3 h-3 mr-1" />免费期</Badge>;
    }

    if (endDate && now > endDate) {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />已到期</Badge>;
    }

    if (membership.status === 'active') {
      return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />正常</Badge>;
    }

    return <Badge variant="secondary">未知</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // 检查是否是平台管理员
  if (profile?.role !== 'super_admin') {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            您没有权限访问此页面，仅平台管理员可以访问。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // 统计数据
  const stats = {
    total: memberships.length,
    active: memberships.filter(m => m.status === 'active').length,
    trial: memberships.filter(m => m.is_trial).length,
    expiringSoon: memberships.filter(m => {
      const days = getDaysRemaining(m.end_date);
      return days !== null && days > 0 && days <= 30;
    }).length,
    expired: memberships.filter(m => {
      const days = getDaysRemaining(m.end_date);
      return days !== null && days < 0;
    }).length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">会员管理</h1>
        <p className="text-muted-foreground mt-2">管理所有车商的会员信息</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">总会员数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">正常会员</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">免费期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.trial}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">即将到期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">已到期</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* 会员列表 */}
      <Card>
        <CardHeader>
          <CardTitle>会员列表</CardTitle>
          <CardDescription>所有车商的会员信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>车行名称</TableHead>
                  <TableHead>会员等级</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>开始日期</TableHead>
                  <TableHead>结束日期</TableHead>
                  <TableHead>剩余天数</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberships.map((membership) => {
                  const daysRemaining = getDaysRemaining(membership.end_date);
                  return (
                    <TableRow key={membership.id}>
                      <TableCell className="font-medium">
                        {membership.dealership?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {membership.tier && (
                          <Badge className={getTierBadgeColor(membership.tier.tier_level)}>
                            {membership.tier.tier_name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(membership)}</TableCell>
                      <TableCell>{formatDate(membership.start_date)}</TableCell>
                      <TableCell>{formatDate(membership.end_date)}</TableCell>
                      <TableCell>
                        {daysRemaining !== null ? (
                          <span className={daysRemaining < 0 ? 'text-red-600' : daysRemaining <= 30 ? 'text-orange-600' : ''}>
                            {daysRemaining < 0 ? `已过期${Math.abs(daysRemaining)}天` : `${daysRemaining}天`}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenRenewDialog(membership)}
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          续费
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 续费对话框 */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>会员续费</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>车行名称</Label>
              <Input
                value={selectedMembership?.dealership?.name || ''}
                disabled
              />
            </div>

            <div>
              <Label>当前等级</Label>
              <Input
                value={selectedMembership?.tier?.tier_name || ''}
                disabled
              />
            </div>

            <div>
              <Label>选择会员等级</Label>
              <Select
                value={renewForm.tierId}
                onValueChange={(value) => setRenewForm({ ...renewForm, tierId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择会员等级" />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.tier_name} - ¥{tier.annual_fee}/年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>支付方式</Label>
              <Select
                value={renewForm.paymentMethod}
                onValueChange={(value) => setRenewForm({ ...renewForm, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="线下支付">线下支付</SelectItem>
                  <SelectItem value="微信转账">微信转账</SelectItem>
                  <SelectItem value="支付宝转账">支付宝转账</SelectItem>
                  <SelectItem value="银行转账">银行转账</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>交易流水号</Label>
              <Input
                value={renewForm.transactionId}
                onChange={(e) => setRenewForm({ ...renewForm, transactionId: e.target.value })}
                placeholder="输入支付流水号"
              />
            </div>

            <div>
              <Label>备注</Label>
              <Input
                value={renewForm.notes}
                onChange={(e) => setRenewForm({ ...renewForm, notes: e.target.value })}
                placeholder="输入备注信息"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                续费后，会员期限将从当前到期日延长1年。如果当前会员已到期，则从今天开始计算。
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleRenew}>
              确认续费
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
