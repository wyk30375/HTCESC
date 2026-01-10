import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { profilesApi } from '@/db/api';
import type { Employee } from '@/types/types';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { PageWrapper } from '@/components/common/PageWrapper';

export default function Employees() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // 注册用户即为员工，直接从 profiles 表加载所有用户
      const profilesData = await profilesApi.getAll();
      
      // 将 profiles 转换为 employees 格式
      const employeesData: Employee[] = profilesData.map((profile: any) => ({
        id: profile.id,
        profile_id: profile.id,
        name: profile.username || profile.email?.split('@')[0] || '未命名',
        position: profile.role === 'admin' ? '管理员' : '员工',
        contact: profile.phone || '未填写',
        hire_date: profile.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        is_active: true,
        created_at: profile.created_at,
        updated_at: profile.updated_at || profile.created_at,
      }));
      setEmployees(employeesData);
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

    // 验证手机号码格式
    if (formData.contact && formData.contact !== '未填写') {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(formData.contact)) {
        toast.error('请输入正确的手机号码（11位，1开头）');
        return;
      }
    }
    
    try {
      if (editingEmployee) {
        // 更新 profiles 表的 username 和 phone 字段
        await profilesApi.update(editingEmployee.id, {
          username: formData.name,
          phone: formData.contact === '未填写' ? '' : formData.contact,
        });
        toast.success('员工信息已更新');
      } else {
        // 不支持手动添加员工，员工通过注册创建
        toast.error('员工通过注册系统自动创建，无需手动添加');
        return;
      }
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('保存员工失败:', error);
      toast.error('保存员工失败');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
    });
    setEditingEmployee(null);
  };

  const openEditDialog = (employee: Employee) => {
    if (!isAdmin) {
      toast.error('只有管理员可以编辑员工信息');
      return;
    }
    
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      contact: employee.contact,
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <PageWrapper title="员工管理" description="管理员工基本信息">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 bg-muted" />
          <Skeleton className="h-96 bg-muted" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="员工管理"
      description={`管理员工基本信息${!isAdmin ? '（员工权限：仅查看，不可修改）' : ''}。员工角色在每台车交易时动态分配。`}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>员工列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>职位</TableHead>
                  <TableHead>手机号码</TableHead>
                  <TableHead>入职日期</TableHead>
                  <TableHead>状态</TableHead>
                  {isAdmin && <TableHead>操作</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.contact}</TableCell>
                    <TableCell>{employee.hire_date}</TableCell>
                    <TableCell>
                      <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                        {employee.is_active ? '在职' : '离职'}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 编辑对话框 */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑员工信息</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">手机号码</Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="请输入手机号码"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit">保存</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* 说明卡片 */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <p className="font-medium text-primary">💡 关于员工角色</p>
              <p className="text-muted-foreground">
                员工角色（销售员、押车出资人、地租出资人）不是固定的，而是在每台车交易时动态分配。
              </p>
              <p className="text-muted-foreground">
                同一个员工可以在不同的车辆交易中扮演不同的角色，利润分配基于每台车的实际角色分配。
              </p>
              <p className="text-muted-foreground">
                请在"销售管理"页面录入车辆销售信息时，为每台车指定相应的角色人员。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
