import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { dealershipsApi } from '@/db/api';
import type { Dealership } from '@/types/types';
import { Building2, Plus, Edit, Power, PowerOff, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Dealerships() {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';
  
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editingDealership, setEditingDealership] = useState<Dealership | null>(null);
  const [viewingDealership, setViewingDealership] = useState<Dealership | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_person: '',
    contact_phone: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
  });

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
      const data = await dealershipsApi.getAll();
      setDealerships(data);
    } catch (error) {
      console.error('加载车行列表失败:', error);
      toast.error('加载车行列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    if (!formData.name || !formData.code) {
      toast.error('请填写车行名称和代码');
      return;
    }

    // 验证车行代码格式
    const codeRegex = /^[a-zA-Z0-9_]+$/;
    if (!codeRegex.test(formData.code)) {
      toast.error('车行代码只能包含字母、数字和下划线');
      return;
    }

    try {
      if (editingDealership) {
        await dealershipsApi.update(editingDealership.id, formData);
        toast.success('车行信息已更新');
      } else {
        await dealershipsApi.create(formData);
        toast.success('车行已创建');
      }
      setDialogOpen(false);
      resetForm();
      loadDealerships();
    } catch (error: any) {
      console.error('保存车行失败:', error);
      if (error.message?.includes('duplicate key')) {
        toast.error('车行代码已存在，请更换');
      } else {
        toast.error(error.message || '保存车行失败');
      }
    }
  };

  const handleEdit = (dealership: Dealership) => {
    setEditingDealership(dealership);
    setFormData({
      name: dealership.name,
      code: dealership.code,
      contact_person: dealership.contact_person || '',
      contact_phone: dealership.contact_phone || '',
      address: dealership.address || '',
      status: dealership.status,
    });
    setDialogOpen(true);
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

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      contact_person: '',
      contact_phone: '',
      address: '',
      status: 'active',
    });
    setEditingDealership(null);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                车行列表
              </CardTitle>
              <CardDescription className="mt-2">
                管理平台上的所有车行
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  创建车行
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingDealership ? '编辑车行' : '创建新车行'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">车行名称 *</Label>
                      <Input
                        id="name"
                        placeholder="例如：易驰汽车"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="code">车行代码 *</Label>
                      <Input
                        id="code"
                        placeholder="例如：yichi"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        disabled={!!editingDealership}
                        required
                      />
                      {editingDealership && (
                        <p className="text-xs text-muted-foreground">
                          车行代码创建后不可修改
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_person">联系人</Label>
                      <Input
                        id="contact_person"
                        placeholder="联系人姓名"
                        value={formData.contact_person}
                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">联系电话</Label>
                      <Input
                        id="contact_phone"
                        placeholder="联系电话"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">车行地址</Label>
                    <Textarea
                      id="address"
                      placeholder="车行详细地址"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="min-h-20"
                    />
                  </div>

                  {editingDealership && (
                    <div className="space-y-2">
                      <Label htmlFor="status">状态</Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="active">正常</option>
                        <option value="inactive">停用</option>
                      </select>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDialogClose(false)}
                    >
                      取消
                    </Button>
                    <Button type="submit">
                      {editingDealership ? '保存' : '创建'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>车行名称</TableHead>
                    <TableHead>车行代码</TableHead>
                    <TableHead>联系人</TableHead>
                    <TableHead>联系电话</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dealerships.map((dealership) => (
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
                        <Badge variant={dealership.status === 'active' ? 'default' : 'secondary'}>
                          {dealership.status === 'active' ? '正常' : '停用'}
                        </Badge>
                      </TableCell>
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
                            onClick={() => handleEdit(dealership)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(dealership)}
                          >
                            {dealership.status === 'active' ? (
                              <PowerOff className="h-4 w-4 text-destructive" />
                            ) : (
                              <Power className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
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

              <div>
                <Label className="text-muted-foreground">车行地址</Label>
                <p className="mt-1">{viewingDealership.address || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <p className="mt-1">
                    <Badge variant={viewingDealership.status === 'active' ? 'default' : 'secondary'}>
                      {viewingDealership.status === 'active' ? '正常' : '停用'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">创建时间</Label>
                  <p className="mt-1">
                    {new Date(viewingDealership.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
