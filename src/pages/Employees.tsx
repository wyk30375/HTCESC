import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { employeesApi, employeeRolesApi, profilesApi } from '@/db/api';
import type { Employee, EmployeeRole, EmployeeRoleType } from '@/types/types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roleTypeLabels: Record<EmployeeRoleType, string> = {
  landlord: '地租',
  bonus_pool: '月奖金池',
  sales_commission: '销售提成',
  investor: '押车出资人',
};

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeRoles, setEmployeeRoles] = useState<Record<string, EmployeeRole[]>>({});
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  const [formData, setFormData] = useState({
    profile_id: '',
    name: '',
    position: '',
    contact: '',
    hire_date: new Date().toISOString().split('T')[0],
  });

  const [roleFormData, setRoleFormData] = useState<{
    [key in EmployeeRoleType]?: { checked: boolean; share: number };
  }>({
    landlord: { checked: false, share: 100 },
    bonus_pool: { checked: false, share: 100 },
    sales_commission: { checked: false, share: 100 },
    investor: { checked: false, share: 100 },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesData, profilesData] = await Promise.all([
        employeesApi.getAll(),
        profilesApi.getAll(),
      ]);
      setEmployees(employeesData);
      setProfiles(profilesData);

      // 加载每个员工的角色
      const rolesMap: Record<string, EmployeeRole[]> = {};
      for (const emp of employeesData) {
        const roles = await employeeRolesApi.getByEmployeeId(emp.id);
        rolesMap[emp.id] = roles;
      }
      setEmployeeRoles(rolesMap);
    } catch (error) {
      console.error('加载员工数据失败:', error);
      toast.error('加载员工数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await employeesApi.update(editingEmployee.id, formData);
        toast.success('员工信息已更新');
      } else {
        await employeesApi.create(formData as any);
        toast.success('员工已添加');
      }
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('保存员工失败:', error);
      toast.error('保存员工失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个员工吗？')) return;
    try {
      await employeesApi.update(id, { is_active: false });
      toast.success('员工已停用');
      loadData();
    } catch (error) {
      console.error('删除员工失败:', error);
      toast.error('删除员工失败');
    }
  };

  const handleEditRoles = (employee: Employee) => {
    setSelectedEmployeeId(employee.id);
    const roles = employeeRoles[employee.id] || [];
    
    const newRoleFormData: typeof roleFormData = {
      landlord: { checked: false, share: 100 },
      bonus_pool: { checked: false, share: 100 },
      sales_commission: { checked: false, share: 100 },
      investor: { checked: false, share: 100 },
    };

    roles.forEach((role) => {
      newRoleFormData[role.role_type] = {
        checked: true,
        share: Number(role.share_percentage),
      };
    });

    setRoleFormData(newRoleFormData);
    setRoleDialogOpen(true);
  };

  const handleSaveRoles = async () => {
    try {
      const currentRoles = employeeRoles[selectedEmployeeId] || [];
      
      // 删除未选中的角色
      for (const role of currentRoles) {
        if (!roleFormData[role.role_type]?.checked) {
          await employeeRolesApi.delete(role.id);
        }
      }

      // 添加或更新选中的角色
      for (const [roleType, data] of Object.entries(roleFormData)) {
        if (data?.checked) {
          const existingRole = currentRoles.find((r) => r.role_type === roleType);
          if (existingRole) {
            await employeeRolesApi.updateSharePercentage(existingRole.id, data.share);
          } else {
            await employeeRolesApi.add(selectedEmployeeId, roleType as EmployeeRoleType, data.share);
          }
        }
      }

      toast.success('角色已更新');
      setRoleDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('保存角色失败:', error);
      toast.error('保存角色失败');
    }
  };

  const resetForm = () => {
    setFormData({
      profile_id: '',
      name: '',
      position: '',
      contact: '',
      hire_date: new Date().toISOString().split('T')[0],
    });
    setEditingEmployee(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      profile_id: employee.profile_id || '',
      name: employee.name,
      position: employee.position,
      contact: employee.contact,
      hire_date: employee.hire_date,
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-muted" />
        <Skeleton className="h-96 bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">员工管理</h1>
          <p className="text-muted-foreground mt-2">管理员工信息和角色分配</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              添加员工
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEmployee ? '编辑员工' : '添加员工'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingEmployee && (
                <div className="space-y-2">
                  <Label htmlFor="profile_id">关联用户</Label>
                  <Select
                    value={formData.profile_id}
                    onValueChange={(value) => setFormData({ ...formData, profile_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择用户" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                <Label htmlFor="position">职位</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">联系方式</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hire_date">入职日期</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
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
      </div>

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
                <TableHead>联系方式</TableHead>
                <TableHead>入职日期</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
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
                    <div className="flex flex-wrap gap-1">
                      {(employeeRoles[employee.id] || []).map((role) => (
                        <Badge key={role.id} variant="secondary">
                          {roleTypeLabels[role.role_type]}
                          {role.share_percentage !== 100 && ` (${role.share_percentage}%)`}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                      {employee.is_active ? '在职' : '离职'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditRoles(employee)}
                      >
                        <Badge variant="outline">角色</Badge>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑员工角色</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(roleTypeLabels).map(([roleType, label]) => (
              <div key={roleType} className="flex items-center gap-4">
                <Checkbox
                  checked={roleFormData[roleType as EmployeeRoleType]?.checked || false}
                  onCheckedChange={(checked) =>
                    setRoleFormData({
                      ...roleFormData,
                      [roleType]: {
                        ...roleFormData[roleType as EmployeeRoleType],
                        checked: !!checked,
                      },
                    })
                  }
                />
                <Label className="flex-1">{label}</Label>
                {roleFormData[roleType as EmployeeRoleType]?.checked && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={roleFormData[roleType as EmployeeRoleType]?.share || 100}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          [roleType]: {
                            ...roleFormData[roleType as EmployeeRoleType],
                            share: Number(e.target.value),
                          },
                        })
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveRoles}>保存</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
