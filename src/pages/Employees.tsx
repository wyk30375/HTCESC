import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { profilesApi } from '@/db/api';
import type { Profile } from '@/types/types';
import { Edit, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { PageWrapper } from '@/components/common/PageWrapper';

export default function Employees() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Profile | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '123456',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profilesData = await profilesApi.getAll();
      setEmployees(profilesData);
    } catch (error) {
      console.error('加载员工数据失败:', error);
      toast.error('加载员工数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('只有管理员可以管理员工信息');
      return;
    }

    // 验证必填字段
    if (!formData.username || !formData.email) {
      toast.error('请填写员工姓名和邮箱');
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('请输入正确的邮箱格式');
      return;
    }

    // 验证手机号码格式
    if (formData.phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error('请输入正确的手机号码（11位，1开头）');
        return;
      }
    }
    
    try {
      if (editingEmployee) {
        // 编辑员工
        await profilesApi.update(editingEmployee.id, {
          username: formData.username,
          phone: formData.phone || undefined,
        });
        toast.success('员工信息更新成功');
      } else {
        // 添加新员工
        await profilesApi.createUser(
          formData.email,
          formData.password,
          formData.username,
          formData.phone || undefined
        );
        toast.success('员工添加成功，账号密码已派发');
      }
      
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('操作失败:', error);
      toast.error(error.message || '操作失败');
    }
  };

  const handleEdit = (employee: Profile) => {
    setEditingEmployee(employee);
    setFormData({
      username: employee.username,
      email: employee.email || '',
      phone: employee.phone || '',
      password: '123456',
    });
    setDialogOpen(true);
  };

  const handleToggleStatus = async (employee: Profile) => {
    if (!isAdmin) {
      toast.error('只有管理员可以管理员工状态');
      return;
    }

    try {
      const newStatus = employee.status === 'active' ? 'inactive' : 'active';
      await profilesApi.updateStatus(employee.id, newStatus);
      toast.success(newStatus === 'active' ? '员工已启用' : '员工已禁用');
      loadData();
    } catch (error) {
      console.error('更新员工状态失败:', error);
      toast.error('更新员工状态失败');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      phone: '',
      password: '123456',
    });
    setEditingEmployee(null);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">员工管理</h1>
            <p className="text-muted-foreground mt-2">管理员工信息和账号权限</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setDialogOpen(true)}>
              添加员工
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>员工列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>姓名</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>手机号</TableHead>
                    <TableHead>登录密码</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>入职日期</TableHead>
                    {isAdmin && <TableHead className="text-right">操作</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.username}</TableCell>
                      <TableCell>{employee.email || '-'}</TableCell>
                      <TableCell>{employee.phone || '-'}</TableCell>
                      <TableCell>
                        {employee.default_password ? (
                          <span className="text-muted-foreground">123456（默认）</span>
                        ) : (
                          <span className="text-muted-foreground">已修改</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'}>
                          {employee.role === 'admin' ? '管理员' : '员工'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.status === 'active' ? 'default' : 'destructive'}>
                          {employee.status === 'active' ? '在职' : '离职'}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.created_at?.split('T')[0] || '-'}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {employee.id !== profile?.id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleStatus(employee)}
                                title={employee.status === 'active' ? '禁用账号' : '启用账号'}
                              >
                                {employee.status === 'active' ? (
                                  <UserX className="h-4 w-4 text-destructive" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-primary" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {employees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-muted-foreground">
                        暂无员工数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEmployee ? '编辑员工' : '添加员工'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">员工姓名 *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="请输入员工姓名"
                  required
                />
              </div>
              
              {!editingEmployee && (
                <>
                  <div>
                    <Label htmlFor="email">邮箱 *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="请输入邮箱（用于登录）"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">登录密码</Label>
                    <Input
                      id="password"
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="默认密码：123456"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      默认密码为 123456，员工首次登录后可自行修改
                    </p>
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="请输入手机号"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  取消
                </Button>
                <Button type="submit">
                  {editingEmployee ? '保存' : '添加'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}
