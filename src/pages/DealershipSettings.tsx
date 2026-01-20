import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { Loader2, Building2, MapPin, Phone, User, FileText } from 'lucide-react';
import type { Dealership } from '@/types/types';
import { regions } from '@/data/regions';

export default function DealershipSettings() {
  const { dealership: authDealership, refreshDealership, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Dealership>>({
    name: '',
    contact_person: '',
    contact_phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
  });

  // 密码修改相关状态
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (authDealership) {
      setFormData({
        name: authDealership.name || '',
        contact_person: authDealership.contact_person || '',
        contact_phone: authDealership.contact_phone || '',
        province: authDealership.province || '',
        city: authDealership.city || '',
        district: authDealership.district || '',
        address: authDealership.address || '',
      });
    }
  }, [authDealership]);

  // 根据选择的省份获取城市列表
  const availableCities = useMemo(() => {
    if (!formData.province) return [];
    const province = regions.find(p => p.name === formData.province);
    return province?.cities || [];
  }, [formData.province]);

  // 根据选择的城市获取区县列表
  const availableDistricts = useMemo(() => {
    if (!formData.city) return [];
    const city = availableCities.find(c => c.name === formData.city);
    return city?.districts || [];
  }, [formData.city, availableCities]);

  // 省份变化时，重置城市和区县
  const handleProvinceChange = (value: string) => {
    setFormData({
      ...formData,
      province: value,
      city: '',
      district: '',
    });
  };

  // 城市变化时，重置区县
  const handleCityChange = (value: string) => {
    setFormData({
      ...formData,
      city: value,
      district: '',
    });
  };

  const handleSave = async () => {
    if (!authDealership?.id) {
      toast.error('未找到车行信息');
      return;
    }

    // 验证必填字段
    if (!formData.name?.trim()) {
      toast.error('请输入车行名称');
      return;
    }

    if (!formData.contact_phone?.trim()) {
      toast.error('请输入联系电话');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('dealerships')
        .update({
          name: formData.name.trim(),
          contact_person: formData.contact_person?.trim() || null,
          contact_phone: formData.contact_phone.trim(),
          province: formData.province?.trim() || null,
          city: formData.city?.trim() || null,
          district: formData.district?.trim() || null,
          address: formData.address?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authDealership.id);

      if (error) throw error;

      toast.success('车行信息已更新');
      
      // 刷新车行信息
      await refreshDealership();
    } catch (error: any) {
      console.error('保存车行信息失败:', error);
      toast.error(error.message || '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 修改密码
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('请填写所有密码字段');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('新密码长度至少为6位');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('两次输入的新密码不一致');
      return;
    }

    if (oldPassword === newPassword) {
      toast.error('新密码不能与旧密码相同');
      return;
    }

    if (!profile?.username) {
      toast.error('无法获取用户信息');
      return;
    }

    setChangingPassword(true);
    try {
      // 调用 Edge Function 修改密码
      const { data, error } = await supabase.functions.invoke('reset-admin-password', {
        body: {
          username: profile.username,
          oldPassword: oldPassword,
          newPassword: newPassword,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast.success('密码修改成功！');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data?.message || '密码修改失败');
      }
    } catch (error: any) {
      console.error('修改密码失败:', error);
      toast.error(error.message || '密码修改失败');
    } finally {
      setChangingPassword(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">已激活</Badge>;
      case 'pending':
        return <Badge variant="secondary">待审核</Badge>;
      case 'inactive':
        return <Badge variant="secondary">已停用</Badge>;
      case 'rejected':
        return <Badge variant="destructive">审核拒绝</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">车行信息</h1>
        <p className="text-muted-foreground mt-2">
          管理您的车行基本信息和联系方式
        </p>
      </div>

      <div className="grid gap-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              基本信息
            </CardTitle>
            <CardDescription>
              车行的基本信息和状态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">车行名称 <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入车行名称"
                />
              </div>
              <div className="space-y-2">
                <Label>车行状态</Label>
                <div className="flex items-center h-10">
                  {authDealership && getStatusBadge(authDealership.status)}
                </div>
              </div>
            </div>

            {authDealership?.status === 'rejected' && authDealership.rejected_reason && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm font-medium text-destructive mb-1">审核拒绝原因：</p>
                <p className="text-sm text-muted-foreground">{authDealership.rejected_reason}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">车行编码</Label>
                <Input
                  id="code"
                  value={authDealership?.code || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_license">营业执照</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="business_license"
                    value={authDealership?.business_license ? '已上传' : '未上传'}
                    disabled
                    className="bg-muted flex-1"
                  />
                  {authDealership?.business_license && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(authDealership.business_license, '_blank')}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      查看
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 联系信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              联系信息
            </CardTitle>
            <CardDescription>
              车行的联系人和联系方式
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person">联系人</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="请输入联系人姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">联系电话 <span className="text-destructive">*</span></Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="请输入联系电话"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 地址信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              地址信息
            </CardTitle>
            <CardDescription>
              车行的所在地址
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">省份</Label>
                <Select value={formData.province} onValueChange={handleProvinceChange}>
                  <SelectTrigger id="province">
                    <SelectValue placeholder="请选择省份" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((province) => (
                      <SelectItem key={province.name} value={province.name}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">城市</Label>
                <Select 
                  value={formData.city} 
                  onValueChange={handleCityChange}
                  disabled={!formData.province}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder={formData.province ? "请选择城市" : "请先选择省份"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">区县</Label>
                <Select 
                  value={formData.district} 
                  onValueChange={(value) => setFormData({ ...formData, district: value })}
                  disabled={!formData.city}
                >
                  <SelectTrigger id="district">
                    <SelectValue placeholder={formData.city ? "请选择区县" : "请先选择城市"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((district) => (
                      <SelectItem key={district.name} value={district.name}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">详细地址</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="请输入详细地址"
              />
            </div>
          </CardContent>
        </Card>

        {/* 账号安全 */}
        <Card>
          <CardHeader>
            <CardTitle>账号安全</CardTitle>
            <CardDescription>修改您的登录密码</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old-password">当前密码 *</Label>
                <Input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="请输入当前密码"
                  disabled={changingPassword}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">新密码 *</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码（至少6位）"
                  disabled={changingPassword}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码 *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                  disabled={changingPassword}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  密码长度至少为6位，建议使用字母、数字和符号组合
                </p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={changingPassword}>
                  {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  修改密码
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (authDealership) {
                setFormData({
                  name: authDealership.name || '',
                  contact_person: authDealership.contact_person || '',
                  contact_phone: authDealership.contact_phone || '',
                  province: authDealership.province || '',
                  city: authDealership.city || '',
                  district: authDealership.district || '',
                  address: authDealership.address || '',
                });
                toast.info('已重置为原始数据');
              }
            }}
          >
            重置
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存修改
          </Button>
        </div>
      </div>
    </div>
  );
}
