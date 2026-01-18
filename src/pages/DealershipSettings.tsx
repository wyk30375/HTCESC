import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { Loader2, Building2, MapPin, Phone, User, FileText } from 'lucide-react';
import type { Dealership } from '@/types/types';

export default function DealershipSettings() {
  const { dealership: authDealership, refreshDealership } = useAuth();
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
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="请输入省份"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">城市</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="请输入城市"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">区县</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="请输入区县"
                />
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
