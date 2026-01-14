import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import { supabase } from '@/db/supabase';

interface PlatformEmployee {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  created_at: string;
  dealership_id?: string;
  dealership_name?: string;
}

export default function PlatformEmployees() {
  const [employees, setEmployees] = useState<PlatformEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<PlatformEmployee | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'super_admin',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      // 查询所有平台员工（super_admin）
      // 注意：super_admin 可能有 dealership_id（如吴韩属于易驰汽车）
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          username, 
          email, 
          phone, 
          role, 
          status,
          created_at,
          dealership_id,
          dealership:dealerships!profiles_dealership_id_fkey(name)
        `)
        .eq('role', 'super_admin')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📊 平台员工列表数据:', data);
      console.log('📊 平台员工数量:', data?.length || 0);

      setEmployees(data?.map((item: any) => ({
        id: item.id,
        username: item.username,
        email: item.email,
        phone: item.phone,
        role: item.role,
        status: item.status || 'active',
        created_at: item.created_at,
        dealership_id: item.dealership_id,
        dealership_name: item.dealership?.name,
      })) || []);
    } catch (error) {
      console.error('加载员工列表失败:', error);
      toast.error('加载员工列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (employee?: PlatformEmployee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        username: employee.username,
        email: employee.email || '',
        phone: employee.phone || '',
        password: '',
        role: employee.role,
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'platform_operator',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.phone) {
      toast.error('请填写所有必填字段');
      return;
    }

    if (!editingEmployee && !formData.password) {
      toast.error('请设置密码');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('密码长度至少为6位');
      return;
    }

    try {
      if (editingEmployee) {
        // 编辑员工
        const { error } = await supabase
          .from('profiles')
          .update({
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
          })
          .eq('id', editingEmployee.id);

        if (error) throw error;

        // 如果修改了密码
        if (formData.password) {
          // 注意：修改密码需要特殊处理，这里简化处理
          toast.warning('密码修改功能需要额外实现');
        }

        toast.success('员工信息已更新');
      } else {
        // 添加新员工
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              username: formData.username,
              phone: formData.phone,
              role: formData.role,
              dealership_id: null,
            })
            .eq('id', authData.user.id);

          if (profileError) throw profileError;
        }

        toast.success('员工添加成功');
      }

      setDialogOpen(false);
      loadEmployees();
    } catch (error) {
      console.error('保存员工失败:', error);
      toast.error(error instanceof Error ? error.message : '保存员工失败');
    }
  };

  const handleDelete = async (employee: PlatformEmployee) => {
    if (!confirm(`确定要删除员工"${employee.username}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      // 删除 profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', employee.id);

      if (error) throw error;

      toast.success('员工已删除');
      loadEmployees();
    } catch (error) {
      console.error('删除员工失败:', error);
      toast.error('删除员工失败');
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '超级管理员';
      case 'platform_operator':
        return '平台运营';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'default';
      case 'platform_operator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">平台员工管理</h1>
          <p className="text-muted-foreground mt-2">
            管理平台管理员和运营人员
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <UserPlus className="mr-2 h-4 w-4" />
              添加员工
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? '编辑员工' : '添加员工'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名 *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="请输入用户名"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="请输入邮箱"
                  disabled={!!editingEmployee}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">手机号 *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="请输入手机号"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  密码 {editingEmployee ? '(留空则不修改)' : '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="请输入密码（至少6位）"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">角色 *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">超级管理员</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
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

      <Card>
        <CardHeader>
          <CardTitle>员工列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              加载中...
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无员工数据
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>所属车行</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.username}</TableCell>
                    <TableCell>{employee.email || '-'}</TableCell>
                    <TableCell>{employee.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(employee.role)}>
                        {getRoleName(employee.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {employee.dealership_name ? (
                        <span className="text-sm">{employee.dealership_name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">平台直属</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(employee.created_at).toLocaleDateString('zh-CN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(employee)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
