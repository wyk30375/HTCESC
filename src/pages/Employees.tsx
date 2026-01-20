import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { profilesApi } from '@/db/api';
import type { Profile } from '@/types/types';
import { Edit, UserX, UserCheck, KeyRound, QrCode, ArrowLeft, X, ShieldAlert, CheckCircle, XCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { PageWrapper } from '@/components/common/PageWrapper';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/db/supabase';

export default function Employees() {
  const { profile, dealership } = useAuth();
  const navigate = useNavigate();
  const isAdmin = profile?.role === 'admin';
  
  // 权限检查：只有管理员可以访问员工管理页面
  if (profile && profile.role !== 'admin' && profile.role !== 'super_admin') {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-destructive" />
                <CardTitle>无权访问</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>权限不足</AlertTitle>
                <AlertDescription>
                  只有管理员才能访问员工管理页面。如需查看或管理员工信息，请联系您的车行管理员。
                </AlertDescription>
              </Alert>
              <Button onClick={() => navigate('/')} className="w-full">
                返回仪表盘
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }
  
  const [employees, setEmployees] = useState<Profile[]>([]); // 在职员工
  const [pendingEmployees, setPendingEmployees] = useState<Profile[]>([]); // 待审核员工
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Profile | null>(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [idCardFrontPreview, setIdCardFrontPreview] = useState<string>('');
  const [idCardBackPreview, setIdCardBackPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '123456',
    id_card_front_photo: '',
    id_card_back_photo: '',
    has_base_salary: false,
    base_salary: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profilesData = await profilesApi.getAll();
      
      // 过滤：只显示当前车行的员工
      const currentDealershipEmployees = profilesData.filter(
        p => p.dealership_id === profile?.dealership_id
      );
      
      // 分离在职员工和待审核员工
      const activeEmployees = currentDealershipEmployees.filter(
        p => p.status === 'active'
      );
      const pendingEmployees = currentDealershipEmployees.filter(
        p => p.status === 'pending'
      );
      
      console.log('📊 员工数据统计:');
      console.log('  - 总用户数:', profilesData.length);
      console.log('  - 当前车行员工数:', currentDealershipEmployees.length);
      console.log('  - 在职员工数:', activeEmployees.length);
      console.log('  - 待审核员工数:', pendingEmployees.length);
      console.log('  - 当前车行ID:', profile?.dealership_id);
      
      setEmployees(activeEmployees);
      setPendingEmployees(pendingEmployees);
    } catch (error) {
      console.error('加载员工数据失败:', error);
      toast.error('加载员工数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 上传身份证照片
  const handleIdCardPhotoUpload = async (file: File, type: 'front' | 'back') => {
    // 验证文件大小（最大 1MB）
    if (file.size > 1024 * 1024) {
      toast.error('图片大小不能超过 1MB');
      return;
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    // 验证文件名格式（使用 snake_case）
    const fileName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '_');
    
    try {
      if (type === 'front') {
        setUploadingFront(true);
      } else {
        setUploadingBack(true);
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const fileExt = fileName.split('.').pop();
      const uniqueFileName = `${profile?.dealership_id}_${timestamp}_${type}.${fileExt}`;

      // 上传到 Supabase Storage
      const { data, error } = await supabase.storage
        .from('employee_id_cards')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // 获取公共 URL
      const { data: { publicUrl } } = supabase.storage
        .from('employee_id_cards')
        .getPublicUrl(data.path);

      // 更新表单数据和预览
      if (type === 'front') {
        setFormData({ ...formData, id_card_front_photo: publicUrl });
        setIdCardFrontPreview(publicUrl);
      } else {
        setFormData({ ...formData, id_card_back_photo: publicUrl });
        setIdCardBackPreview(publicUrl);
      }

      toast.success(`身份证${type === 'front' ? '正面' : '反面'}照片上传成功`);
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('图片上传失败，请重试');
    } finally {
      if (type === 'front') {
        setUploadingFront(false);
      } else {
        setUploadingBack(false);
      }
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
          id_card_front_photo: formData.id_card_front_photo || undefined,
          id_card_back_photo: formData.id_card_back_photo || undefined,
          has_base_salary: formData.has_base_salary,
          base_salary: formData.has_base_salary ? formData.base_salary : 0,
        });
        toast.success('员工信息更新成功');
      } else {
        // 添加新员工
        await profilesApi.createUser(
          formData.username,
          formData.password,
          formData.phone || undefined,
          formData.id_card_front_photo || undefined,
          formData.id_card_back_photo || undefined,
          formData.has_base_salary,
          formData.has_base_salary ? formData.base_salary : 0
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
      id_card_front_photo: employee.id_card_front_photo || '',
      id_card_back_photo: employee.id_card_back_photo || '',
      has_base_salary: employee.has_base_salary || false,
      base_salary: employee.base_salary || 0,
    });
    setIdCardFrontPreview(employee.id_card_front_photo || '');
    setIdCardBackPreview(employee.id_card_back_photo || '');
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

  const handleResetPassword = async (employee: Profile) => {
    if (!isAdmin) {
      toast.error('只有管理员可以重置密码');
      return;
    }

    if (!confirm(`确定要将 ${employee.username} 的密码重置为默认密码 123456 吗？`)) {
      return;
    }

    try {
      await profilesApi.resetPassword(employee.id);
      toast.success('密码已重置为 123456，请通知员工修改密码');
      loadData();
    } catch (error) {
      console.error('重置密码失败:', error);
      toast.error('重置密码失败');
    }
  };

  // 审核通过员工申请
  const handleApproveEmployee = async (employee: Profile) => {
    if (!confirm(`确定要审核通过 ${employee.username} 的加入申请吗？`)) {
      return;
    }

    try {
      await profilesApi.approveEmployee(employee.id);
      toast.success(`已审核通过 ${employee.username} 的申请，该员工现在可以登录使用系统`);
      loadData();
    } catch (error) {
      console.error('审核失败:', error);
      toast.error('审核失败');
    }
  };

  // 拒绝员工申请
  const handleRejectEmployee = async (employee: Profile) => {
    if (!confirm(`确定要拒绝 ${employee.username} 的加入申请吗？拒绝后该员工将无法登录系统。`)) {
      return;
    }

    try {
      await profilesApi.rejectEmployee(employee.id);
      toast.success(`已拒绝 ${employee.username} 的申请`);
      loadData();
    } catch (error) {
      console.error('拒绝失败:', error);
      toast.error('拒绝失败');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      phone: '',
      password: '123456',
      id_card_front_photo: '',
      id_card_back_photo: '',
      has_base_salary: false,
      base_salary: 0,
    });
    setEditingEmployee(null);
    setIdCardFrontPreview('');
    setIdCardBackPreview('');
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
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => setQrDialogOpen(true)} 
                className="flex-1 sm:flex-initial h-11 sm:h-10 gap-2"
              >
                <QrCode className="h-4 w-4" />
                员工注册二维码
              </Button>
              <Button onClick={() => setDialogOpen(true)} className="flex-1 sm:flex-initial h-11 sm:h-10">
                添加员工
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              在职员工 ({employees.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              待审核员工 ({pendingEmployees.length})
            </TabsTrigger>
          </TabsList>

          {/* 在职员工列表 */}
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>在职员工列表</CardTitle>
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
                    <TableHead>底薪</TableHead>
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
                        {employee.has_base_salary ? (
                          <span className="text-primary font-medium">
                            ¥{employee.base_salary?.toLocaleString() || 0}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">无底薪</span>
                        )}
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
                              title="编辑员工信息"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleResetPassword(employee)}
                              title="重置密码为123456"
                            >
                              <KeyRound className="h-4 w-4 text-orange-600" />
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

                        {/* 底薪 */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base text-muted-foreground min-w-[70px]">底薪：</span>
                          {employee.has_base_salary ? (
                            <span className="text-sm sm:text-base text-primary font-medium">
                              ¥{employee.base_salary?.toLocaleString() || 0}
                            </span>
                          ) : (
                            <span className="text-sm sm:text-base text-muted-foreground">无底薪</span>
                          )}
                        </div>

                        {/* 操作按钮 */}
                        {isAdmin && (
                          <div className="flex flex-col gap-2 pt-3 border-t">
                            <div className="flex gap-2 sm:gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-11 sm:h-10"
                                onClick={() => handleEdit(employee)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                编辑
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-11 sm:h-10"
                                onClick={() => handleResetPassword(employee)}
                              >
                                <KeyRound className="h-4 w-4 mr-2" />
                                重置密码
                              </Button>
                            </div>
                            {employee.id !== profile?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-11 sm:h-10"
                                onClick={() => handleToggleStatus(employee)}
                              >
                                {employee.status === 'active' ? (
                                  <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    禁用账号
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    启用账号
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
      </TabsContent>

      {/* 待审核员工列表 */}
      <TabsContent value="pending">
        <Card>
          <CardHeader>
            <CardTitle>待审核员工列表</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingEmployees.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                暂无待审核员工
              </div>
            ) : (
              <>
                {/* 桌面端表格视图 */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>姓名</TableHead>
                        <TableHead>手机号</TableHead>
                        <TableHead>申请时间</TableHead>
                        {isAdmin && <TableHead className="text-right">操作</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.username}</TableCell>
                          <TableCell>{employee.phone || '-'}</TableCell>
                          <TableCell>
                            {new Date(employee.created_at).toLocaleDateString('zh-CN')}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApproveEmployee(employee)}
                                  className="gap-1"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  审核通过
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRejectEmployee(employee)}
                                  className="gap-1"
                                >
                                  <XCircle className="h-4 w-4" />
                                  拒绝
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* 移动端卡片视图 */}
                <div className="lg:hidden space-y-4">
                  {pendingEmployees.map((employee) => (
                    <Card key={employee.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{employee.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {employee.phone || '未填写手机号'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              申请时间：{new Date(employee.created_at).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveEmployee(employee)}
                              className="flex-1 gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              审核通过
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectEmployee(employee)}
                              className="flex-1 gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              拒绝
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
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

              {/* 身份证照片上传 */}
              <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ImageIcon className="h-4 w-4" />
                  <span>身份证照片（可选）</span>
                </div>

                {/* 身份证正面 */}
                <div>
                  <Label htmlFor="id-card-front" className="text-sm">身份证正面</Label>
                  <div className="mt-2 flex items-start gap-4">
                    {idCardFrontPreview ? (
                      <div className="relative w-40 h-24 border rounded-lg overflow-hidden">
                        <img
                          src={idCardFrontPreview}
                          alt="身份证正面"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => {
                            setIdCardFrontPreview('');
                            setFormData({ ...formData, id_card_front_photo: '' });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="id-card-front"
                        className="flex flex-col items-center justify-center w-40 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        {uploadingFront ? (
                          <div className="text-xs text-muted-foreground">上传中...</div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">点击上传</span>
                          </>
                        )}
                      </label>
                    )}
                    <input
                      id="id-card-front"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleIdCardPhotoUpload(file, 'front');
                      }}
                      disabled={uploadingFront}
                    />
                    <div className="flex-1 text-xs text-muted-foreground">
                      <p>• 支持 JPG、PNG 格式</p>
                      <p>• 文件大小不超过 1MB</p>
                    </div>
                  </div>
                </div>

                {/* 身份证反面 */}
                <div>
                  <Label htmlFor="id-card-back" className="text-sm">身份证反面</Label>
                  <div className="mt-2 flex items-start gap-4">
                    {idCardBackPreview ? (
                      <div className="relative w-40 h-24 border rounded-lg overflow-hidden">
                        <img
                          src={idCardBackPreview}
                          alt="身份证反面"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => {
                            setIdCardBackPreview('');
                            setFormData({ ...formData, id_card_back_photo: '' });
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="id-card-back"
                        className="flex flex-col items-center justify-center w-40 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                      >
                        {uploadingBack ? (
                          <div className="text-xs text-muted-foreground">上传中...</div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">点击上传</span>
                          </>
                        )}
                      </label>
                    )}
                    <input
                      id="id-card-back"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleIdCardPhotoUpload(file, 'back');
                      }}
                      disabled={uploadingBack}
                    />
                    <div className="flex-1 text-xs text-muted-foreground">
                      <p>• 支持 JPG、PNG 格式</p>
                      <p>• 文件大小不超过 1MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 底薪设置 */}
              <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>底薪设置</span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="has-base-salary"
                    checked={formData.has_base_salary}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      has_base_salary: e.target.checked,
                      base_salary: e.target.checked ? formData.base_salary : 0
                    })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="has-base-salary" className="text-sm cursor-pointer">
                    该员工有底薪
                  </Label>
                </div>

                {formData.has_base_salary && (
                  <div>
                    <Label htmlFor="base-salary" className="text-sm">底薪金额（元/月）*</Label>
                    <Input
                      id="base-salary"
                      type="number"
                      min="0"
                      step="100"
                      placeholder="请输入底薪金额"
                      value={formData.base_salary || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        base_salary: Number.parseFloat(e.target.value) || 0 
                      })}
                      className="h-11 sm:h-10 mt-2"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      底薪将作为员工的固定月收入
                    </p>
                  </div>
                )}
              </div>

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

        {/* 员工注册二维码对话框 */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-accent"
                    onClick={() => setQrDialogOpen(false)}
                    aria-label="返回"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <DialogTitle className="text-xl">员工注册二维码</DialogTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 hover:bg-accent"
                  onClick={() => setQrDialogOpen(false)}
                  aria-label="关闭"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>员工可扫描此二维码进行注册：</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>自动关联到当前车行</li>
                  <li>无需手动输入车行代码</li>
                  <li>注册后等待管理员审核</li>
                </ul>
              </div>
              
              <div className="flex flex-col items-center justify-center py-6 bg-muted/30 rounded-lg">
                {dealership?.code ? (
                  <QRCodeDataUrl
                    data={`${window.location.origin}/register?dealership=${dealership.code}`}
                    size={200}
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>无法生成二维码</p>
                    <p className="text-xs mt-1">车行代码不存在</p>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <p className="font-medium text-foreground">注册链接：</p>
                <p className="break-all font-mono bg-background px-2 py-1 rounded">
                  {dealership?.code 
                    ? `${window.location.origin}/register?dealership=${dealership.code}`
                    : '车行代码不存在'}
                </p>
                <p className="text-xs">可复制此链接发送给员工</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (dealership?.code) {
                      const url = `${window.location.origin}/register?dealership=${dealership.code}`;
                      navigator.clipboard.writeText(url);
                      toast.success('注册链接已复制到剪贴板');
                    }
                  }}
                  className="h-10"
                >
                  复制链接
                </Button>
                <Button onClick={() => setQrDialogOpen(false)} className="h-10">
                  关闭
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}
