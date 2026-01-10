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
    if (!formData.username) {
      toast.error('请填写员工姓名');
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
          formData.username,
          formData.password,
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
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">员工管理</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">管理员工信息和账号权限</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto h-11 sm:h-10">
              添加员工
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>员工列表</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 桌面端表格视图 */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>姓名</TableHead>
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
                      <TableCell colSpan={isAdmin ? 7 : 6} className="text-center text-muted-foreground">
                        暂无员工数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* 移动端卡片视图 */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              {employees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无员工数据
                </div>
              ) : (
                employees.map((employee) => (
                  <Card key={employee.id} className="border-2">
                    <CardContent className="pt-5 sm:pt-6">
                      <div className="space-y-3">
                        {/* 姓名和角色 */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg sm:text-xl font-bold">{employee.username}</h3>
                          <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'} className="text-xs sm:text-sm">
                            {employee.role === 'admin' ? '管理员' : '员工'}
                          </Badge>
                        </div>

                        {/* 状态 */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base text-muted-foreground min-w-[70px]">状态：</span>
                          <Badge variant={employee.status === 'active' ? 'default' : 'destructive'} className="text-xs sm:text-sm">
                            {employee.status === 'active' ? '在职' : '离职'}
                          </Badge>
                        </div>

                        {/* 手机号 */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base text-muted-foreground min-w-[70px]">手机号：</span>
                          <span className="text-sm sm:text-base font-medium">{employee.phone || '-'}</span>
                        </div>

                        {/* 登录密码 */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base text-muted-foreground min-w-[70px]">登录密码：</span>
                          <span className="text-sm sm:text-base">
                            {employee.default_password ? (
                              <span className="text-muted-foreground">123456（默认）</span>
                            ) : (
                              <span className="text-muted-foreground">已修改</span>
                            )}
                          </span>
                        </div>

                        {/* 入职日期 */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base text-muted-foreground min-w-[70px]">入职日期：</span>
                          <span className="text-sm sm:text-base">{employee.created_at?.split('T')[0] || '-'}</span>
                        </div>

                        {/* 操作按钮 */}
                        {isAdmin && (
                          <div className="flex gap-2 sm:gap-3 pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-11 sm:h-10"
                              onClick={() => handleEdit(employee)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              编辑
                            </Button>
                            {employee.id !== profile?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-11 sm:h-10"
                                onClick={() => handleToggleStatus(employee)}
                              >
                                {employee.status === 'active' ? (
                                  <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    禁用
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    启用
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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
                <Label htmlFor="username" className="text-sm sm:text-base">员工姓名 *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="请输入员工姓名"
                  className="h-11 sm:h-10"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-sm sm:text-base">手机号</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="请输入手机号"
                  className="h-11 sm:h-10"
                />
              </div>

              {!editingEmployee && (
                <div>
                  <Label htmlFor="password" className="text-sm sm:text-base">登录密码</Label>
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="默认密码：123456"
                    className="h-11 sm:h-10"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    默认密码为 123456，员工首次登录后可自行修改
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} className="h-11 sm:h-10 w-full sm:w-auto">
                  取消
                </Button>
                <Button type="submit" className="h-11 sm:h-10 w-full sm:w-auto">
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
