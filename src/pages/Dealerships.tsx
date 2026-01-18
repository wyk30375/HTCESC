import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dealershipsApi } from '@/db/api';
import type { Dealership } from '@/types/types';
import { Building2, Power, PowerOff, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Dealerships() {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';
  
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [viewingDealership, setViewingDealership] = useState<Dealership | null>(null);
  const [rejectingDealership, setRejectingDealership] = useState<Dealership | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  

  // 分类车行
  const pendingDealerships = dealerships.filter(d => d.status === 'pending');
  const activeDealerships = dealerships.filter(d => d.status === 'active');
  const inactiveDealerships = dealerships.filter(d => d.status === 'inactive');
  const rejectedDealerships = dealerships.filter(d => d.status === 'rejected');

  console.log('🏢 [车行分类] 总车行数:', dealerships.length);
  console.log('🏢 [车行分类] 待审核:', pendingDealerships.length);
  console.log('🏢 [车行分类] 正常运营:', activeDealerships.length, activeDealerships.map(d => d.name));
  console.log('🏢 [车行分类] 已停用:', inactiveDealerships.length, inactiveDealerships.map(d => d.name));
  console.log('🏢 [车行分类] 已拒绝:', rejectedDealerships.length);

  useEffect(() => {
    if (isSuperAdmin) {
      loadDealerships();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const loadDealerships = async () => {
    try {
      setLoading(true);
      console.log('🏢 [车行管理] 开始加载车行列表...');
      const data = await dealershipsApi.getAll();
      console.log('🏢 [车行管理] ✅ 加载成功，车行数量:', data.length);
      console.log('🏢 [车行管理] 📋 车行数据:', data);
      setDealerships(data);
    } catch (error) {
      console.error('❌ [车行管理] 加载车行列表失败:', error);
      toast.error('加载车行列表失败');
    } finally {
      setLoading(false);
    }
  };


  const handleView = (dealership: Dealership) => {
    setViewingDealership(dealership);
    setDetailDialogOpen(true);
  };

  const handleToggleStatus = async (dealership: Dealership) => {
    const newStatus = dealership.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? '启用' : '停用';
    
    try {
      await dealershipsApi.update(dealership.id, { status: newStatus });
      toast.success(`车行已${action}`);
      loadDealerships();
    } catch (error) {
      console.error(`${action}车行失败:`, error);
      toast.error(`${action}车行失败`);
    }
  };

  // 审核通过
  const handleApprove = async (dealership: Dealership) => {
    try {
      await dealershipsApi.update(dealership.id, { 
        status: 'active',
        reviewed_at: new Date().toISOString(),
        reviewed_by: profile?.id || undefined,
      });
      toast.success('车行审核通过');
      loadDealerships();
    } catch (error) {
      console.error('审核通过失败:', error);
      toast.error('审核通过失败');
    }
  };

  // 打开拒绝对话框
  const handleOpenReject = (dealership: Dealership) => {
    setRejectingDealership(dealership);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  // 审核拒绝
  const handleReject = async () => {
    if (!rejectingDealership) return;
    
    if (!rejectReason.trim()) {
      toast.error('请填写拒绝原因');
      return;
    }

    try {
      await dealershipsApi.update(rejectingDealership.id, { 
        status: 'rejected',
        rejected_reason: rejectReason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: profile?.id || undefined,
      });
      toast.success('已拒绝车行注册申请');
      setRejectDialogOpen(false);
      setRejectingDealership(null);
      setRejectReason('');
      loadDealerships();
    } catch (error) {
      console.error('审核拒绝失败:', error);
      toast.error('审核拒绝失败');
    }
  };


  // 非超级管理员无权访问
  if (!isSuperAdmin) {
    return (
      <PageWrapper title="车行管理">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            您没有权限访问此页面。只有平台超级管理员可以管理车行。
          </AlertDescription>
        </Alert>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="车行管理">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              车行列表
            </CardTitle>
            <CardDescription className="mt-2">
              管理平台上的所有车行
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : dealerships.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无车行</p>
            </div>
          ) : (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending" className="relative">
                  待审核
                  {pendingDealerships.length > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {pendingDealerships.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="active">
                  正常运营 ({activeDealerships.length})
                </TabsTrigger>
                <TabsTrigger value="inactive">
                  已停用 ({inactiveDealerships.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  已拒绝 ({rejectedDealerships.length})
                </TabsTrigger>
              </TabsList>

              {/* 待审核车行 */}
              <TabsContent value="pending" className="mt-4">
                {pendingDealerships.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无待审核车行</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>车行名称</TableHead>
                          <TableHead>车行代码</TableHead>
                          <TableHead>联系人</TableHead>
                          <TableHead>联系电话</TableHead>
                          <TableHead>申请时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingDealerships.map((dealership) => (
                          <TableRow key={dealership.id}>
                            <TableCell className="font-medium">{dealership.name}</TableCell>
                            <TableCell>
                              <code className="px-2 py-1 bg-muted rounded text-xs">
                                {dealership.code}
                              </code>
                            </TableCell>
                            <TableCell>{dealership.contact_person || '-'}</TableCell>
                            <TableCell>{dealership.contact_phone || '-'}</TableCell>
                            <TableCell>
                              {new Date(dealership.created_at).toLocaleString('zh-CN')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(dealership)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApprove(dealership)}
                                  className="gap-1"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  通过
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleOpenReject(dealership)}
                                  className="gap-1"
                                >
                                  <XCircle className="h-4 w-4" />
                                  拒绝
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* 正常运营车行 */}
              <TabsContent value="active" className="mt-4">
                {activeDealerships.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无正常运营车行</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>车行名称</TableHead>
                          <TableHead>车行代码</TableHead>
                          <TableHead>联系人</TableHead>
                          <TableHead>联系电话</TableHead>
                          <TableHead>创建时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeDealerships.map((dealership) => (
                          <TableRow key={dealership.id}>
                            <TableCell className="font-medium">{dealership.name}</TableCell>
                            <TableCell>
                              <code className="px-2 py-1 bg-muted rounded text-xs">
                                {dealership.code}
                              </code>
                            </TableCell>
                            <TableCell>{dealership.contact_person || '-'}</TableCell>
                            <TableCell>{dealership.contact_phone || '-'}</TableCell>
                            <TableCell>
                              {new Date(dealership.created_at).toLocaleDateString('zh-CN')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(dealership)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(dealership)}
                                >
                                  <PowerOff className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* 已停用车行 */}
              <TabsContent value="inactive" className="mt-4">
                {inactiveDealerships.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无已停用车行</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>车行名称</TableHead>
                          <TableHead>车行代码</TableHead>
                          <TableHead>联系人</TableHead>
                          <TableHead>联系电话</TableHead>
                          <TableHead>创建时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inactiveDealerships.map((dealership) => (
                          <TableRow key={dealership.id}>
                            <TableCell className="font-medium">{dealership.name}</TableCell>
                            <TableCell>
                              <code className="px-2 py-1 bg-muted rounded text-xs">
                                {dealership.code}
                              </code>
                            </TableCell>
                            <TableCell>{dealership.contact_person || '-'}</TableCell>
                            <TableCell>{dealership.contact_phone || '-'}</TableCell>
                            <TableCell>
                              {new Date(dealership.created_at).toLocaleDateString('zh-CN')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(dealership)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(dealership)}
                                >
                                  <Power className="h-4 w-4 text-green-600" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* 已拒绝车行 */}
              <TabsContent value="rejected" className="mt-4">
                {rejectedDealerships.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无已拒绝车行</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>车行名称</TableHead>
                          <TableHead>车行代码</TableHead>
                          <TableHead>联系人</TableHead>
                          <TableHead>拒绝原因</TableHead>
                          <TableHead>申请时间</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rejectedDealerships.map((dealership) => (
                          <TableRow key={dealership.id}>
                            <TableCell className="font-medium">{dealership.name}</TableCell>
                            <TableCell>
                              <code className="px-2 py-1 bg-muted rounded text-xs">
                                {dealership.code}
                              </code>
                            </TableCell>
                            <TableCell>{dealership.contact_person || '-'}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {dealership.rejected_reason || '-'}
                            </TableCell>
                            <TableCell>
                              {new Date(dealership.created_at).toLocaleDateString('zh-CN')}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(dealership)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>车行详情</DialogTitle>
          </DialogHeader>
          {viewingDealership && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">车行名称</Label>
                  <p className="mt-1 font-medium">{viewingDealership.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">车行代码</Label>
                  <p className="mt-1">
                    <code className="px-2 py-1 bg-muted rounded text-sm">
                      {viewingDealership.code}
                    </code>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">联系人</Label>
                  <p className="mt-1">{viewingDealership.contact_person || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">联系电话</Label>
                  <p className="mt-1">{viewingDealership.contact_phone || '-'}</p>
                </div>
              </div>

              {(viewingDealership.province || viewingDealership.city || viewingDealership.district) && (
                <div>
                  <Label className="text-muted-foreground">所在地区</Label>
                  <p className="mt-1">
                    {[viewingDealership.province, viewingDealership.city, viewingDealership.district]
                      .filter(Boolean)
                      .join(' ')}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">车行地址</Label>
                <p className="mt-1">{viewingDealership.address || '-'}</p>
              </div>

              {viewingDealership.business_license && (
                <div>
                  <Label className="text-muted-foreground">营业执照</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <img 
                      src={viewingDealership.business_license} 
                      alt="营业执照" 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <p className="mt-1">
                    <Badge 
                      variant={
                        viewingDealership.status === 'active' ? 'default' : 
                        viewingDealership.status === 'pending' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {viewingDealership.status === 'active' ? '正常运营' : 
                       viewingDealership.status === 'pending' ? '待审核' : 
                       viewingDealership.status === 'inactive' ? '已停用' : 
                       '审核拒绝'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">申请时间</Label>
                  <p className="mt-1">
                    {new Date(viewingDealership.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>

              {viewingDealership.rejected_reason && (
                <div>
                  <Label className="text-muted-foreground">拒绝原因</Label>
                  <p className="mt-1 text-destructive">{viewingDealership.rejected_reason}</p>
                </div>
              )}

              {viewingDealership.reviewed_at && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">审核时间</Label>
                    <p className="mt-1">
                      {new Date(viewingDealership.reviewed_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 拒绝对话框 */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>拒绝车行注册申请</DialogTitle>
          </DialogHeader>
          {rejectingDealership && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">车行名称</Label>
                <p className="mt-1 font-medium">{rejectingDealership.name}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reject-reason">拒绝原因 *</Label>
                <Textarea
                  id="reject-reason"
                  placeholder="请填写拒绝原因，将通知申请人"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-24"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectDialogOpen(false)}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleReject}
                >
                  确认拒绝
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </PageWrapper>
  );
}
