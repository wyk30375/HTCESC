import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Bell, Shield, Database, Mail } from 'lucide-react';

export default function PlatformSettings() {
  const [loading, setLoading] = useState(false);
  
  // 平台基本信息
  const [platformInfo, setPlatformInfo] = useState({
    name: '二手车销售管理平台',
    description: '专业的二手车行管理SaaS平台',
    contactEmail: 'support@platform.com',
    contactPhone: '400-888-8888',
    address: '浙江省杭州市',
  });

  // 审核规则
  const [reviewRules, setReviewRules] = useState({
    autoReview: false,
    reviewTimeLimit: '24',
    requireLicense: true,
    requirePhone: true,
  });

  // 通知设置
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotification: true,
    smsNotification: false,
    newDealershipAlert: true,
    salesAlert: false,
  });

  // 数据备份设置
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: '30',
  });

  const handleSavePlatformInfo = async () => {
    setLoading(true);
    try {
      // 这里应该调用 API 保存设置
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('平台信息已保存');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReviewRules = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('审核规则已保存');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('通知设置已保存');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBackup = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('备份设置已保存');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupNow = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('数据备份已完成');
    } catch (error) {
      toast.error('备份失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">系统设置</h1>
        <p className="text-muted-foreground mt-2">
          配置平台参数和系统设置
        </p>
      </div>

      <Tabs defaultValue="platform" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platform">
            <SettingsIcon className="h-4 w-4 mr-2" />
            平台信息
          </TabsTrigger>
          <TabsTrigger value="review">
            <Shield className="h-4 w-4 mr-2" />
            审核规则
          </TabsTrigger>
          <TabsTrigger value="notification">
            <Bell className="h-4 w-4 mr-2" />
            通知设置
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Database className="h-4 w-4 mr-2" />
            数据备份
          </TabsTrigger>
        </TabsList>

        {/* 平台基本信息 */}
        <TabsContent value="platform">
          <Card>
            <CardHeader>
              <CardTitle>平台基本信息</CardTitle>
              <CardDescription>
                配置平台的基本信息和联系方式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">平台名称</Label>
                <Input
                  id="platform-name"
                  value={platformInfo.name}
                  onChange={(e) => setPlatformInfo({ ...platformInfo, name: e.target.value })}
                  placeholder="请输入平台名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform-description">平台简介</Label>
                <Textarea
                  id="platform-description"
                  value={platformInfo.description}
                  onChange={(e) => setPlatformInfo({ ...platformInfo, description: e.target.value })}
                  placeholder="请输入平台简介"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">联系邮箱</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={platformInfo.contactEmail}
                    onChange={(e) => setPlatformInfo({ ...platformInfo, contactEmail: e.target.value })}
                    placeholder="请输入联系邮箱"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone">联系电话</Label>
                  <Input
                    id="contact-phone"
                    value={platformInfo.contactPhone}
                    onChange={(e) => setPlatformInfo({ ...platformInfo, contactPhone: e.target.value })}
                    placeholder="请输入联系电话"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">平台地址</Label>
                <Input
                  id="address"
                  value={platformInfo.address}
                  onChange={(e) => setPlatformInfo({ ...platformInfo, address: e.target.value })}
                  placeholder="请输入平台地址"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePlatformInfo} disabled={loading}>
                  {loading ? '保存中...' : '保存设置'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 审核规则 */}
        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>车行审核规则</CardTitle>
              <CardDescription>
                配置车行注册申请的审核规则和要求
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自动审核</Label>
                  <p className="text-sm text-muted-foreground">
                    符合条件的申请自动通过审核
                  </p>
                </div>
                <Switch
                  checked={reviewRules.autoReview}
                  onCheckedChange={(checked) => setReviewRules({ ...reviewRules, autoReview: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-time-limit">审核时限（小时）</Label>
                <Select
                  value={reviewRules.reviewTimeLimit}
                  onValueChange={(value) => setReviewRules({ ...reviewRules, reviewTimeLimit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12小时</SelectItem>
                    <SelectItem value="24">24小时</SelectItem>
                    <SelectItem value="48">48小时</SelectItem>
                    <SelectItem value="72">72小时</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  超过时限未审核的申请将自动提醒
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>要求营业执照</Label>
                  <p className="text-sm text-muted-foreground">
                    申请时必须上传营业执照
                  </p>
                </div>
                <Switch
                  checked={reviewRules.requireLicense}
                  onCheckedChange={(checked) => setReviewRules({ ...reviewRules, requireLicense: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>要求手机号验证</Label>
                  <p className="text-sm text-muted-foreground">
                    申请时必须验证手机号
                  </p>
                </div>
                <Switch
                  checked={reviewRules.requirePhone}
                  onCheckedChange={(checked) => setReviewRules({ ...reviewRules, requirePhone: checked })}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveReviewRules} disabled={loading}>
                  {loading ? '保存中...' : '保存设置'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notification">
          <Card>
            <CardHeader>
              <CardTitle>通知设置</CardTitle>
              <CardDescription>
                配置系统通知和提醒方式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>邮件通知</Label>
                    <p className="text-sm text-muted-foreground">
                      通过邮件发送重要通知
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.emailNotification}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotification: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>短信通知</Label>
                    <p className="text-sm text-muted-foreground">
                      通过短信发送重要通知
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.smsNotification}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, smsNotification: checked })}
                />
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium">通知事件</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>新车行注册</Label>
                    <p className="text-sm text-muted-foreground">
                      有新车行提交注册申请时通知
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.newDealershipAlert}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newDealershipAlert: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>销售提醒</Label>
                    <p className="text-sm text-muted-foreground">
                      有新的销售记录时通知
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.salesAlert}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, salesAlert: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={loading}>
                  {loading ? '保存中...' : '保存设置'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 数据备份 */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>数据备份</CardTitle>
              <CardDescription>
                配置数据备份策略和执行备份操作
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>自动备份</Label>
                  <p className="text-sm text-muted-foreground">
                    定期自动备份数据库
                  </p>
                </div>
                <Switch
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(checked) => setBackupSettings({ ...backupSettings, autoBackup: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-frequency">备份频率</Label>
                <Select
                  value={backupSettings.backupFrequency}
                  onValueChange={(value) => setBackupSettings({ ...backupSettings, backupFrequency: value })}
                  disabled={!backupSettings.autoBackup}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">每小时</SelectItem>
                    <SelectItem value="daily">每天</SelectItem>
                    <SelectItem value="weekly">每周</SelectItem>
                    <SelectItem value="monthly">每月</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-retention">备份保留天数</Label>
                <Select
                  value={backupSettings.backupRetention}
                  onValueChange={(value) => setBackupSettings({ ...backupSettings, backupRetention: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7天</SelectItem>
                    <SelectItem value="30">30天</SelectItem>
                    <SelectItem value="90">90天</SelectItem>
                    <SelectItem value="365">1年</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  超过保留期的备份将自动删除
                </p>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium">手动备份</h3>
                <p className="text-sm text-muted-foreground">
                  立即执行一次完整的数据备份
                </p>
                <Button onClick={handleBackupNow} disabled={loading} variant="outline">
                  <Database className="mr-2 h-4 w-4" />
                  {loading ? '备份中...' : '立即备份'}
                </Button>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveBackup} disabled={loading}>
                  {loading ? '保存中...' : '保存设置'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
