# 实时通知配置指南

本系统支持通过企业微信群机器人和短信服务向平台管理员发送实时通知。

## 一、企业微信群机器人通知（推荐 ⭐⭐⭐⭐⭐）

### 优点
- ✅ 完全免费
- ✅ 配置简单（5分钟完成）
- ✅ 实时性好（秒级到达）
- ✅ 支持富文本消息
- ✅ 适合企业内部使用

### 配置步骤

#### 1. 创建企业微信群
- 在企业微信中创建一个群聊（如"平台管理通知群"）
- 将需要接收通知的平台管理员拉入群聊

#### 2. 添加群机器人
1. 在群聊中点击右上角 `···` → `群机器人`
2. 点击 `添加机器人`
3. 输入机器人名称（如"车行注册通知"）
4. 点击 `添加`
5. **复制 Webhook 地址**（格式：`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxx`）

#### 3. 配置环境变量
在 Supabase 项目中配置环境变量：

1. 登录 Supabase Dashboard
2. 进入项目 → Settings → Edge Functions
3. 添加环境变量：
   - **变量名：** `WECHAT_WEBHOOK_URL`
   - **变量值：** 粘贴步骤2中复制的 Webhook 地址

#### 4. 测试通知
- 注册一个新车行
- 查看企业微信群是否收到通知消息

### 消息示例
```
## 🔔 新车行注册申请

**车行名称：** 恏淘车二手车行
**车行代码：** haotaocar
**联系人：** 张三
**联系电话：** 13800138000
**注册时间：** 2026-01-10 15:30:00

请登录平台管理后台及时审核该车行的注册申请。

> 发送时间：2026-01-10 15:30:00
```

---

## 二、短信通知（可选）

### 优点
- ✅ 到达率高（99%+）
- ✅ 无需安装应用
- ✅ 适合所有用户

### 缺点
- ❌ 需要付费（约 0.045 元/条）
- ❌ 需要申请短信签名和模板（审核1-3天）

### 配置步骤（以阿里云短信为例）

#### 1. 开通阿里云短信服务
1. 登录 [阿里云控制台](https://www.aliyun.com/)
2. 搜索"短信服务"并开通
3. 完成实名认证

#### 2. 申请短信签名
1. 进入短信服务控制台 → 国内消息 → 签名管理
2. 点击 `添加签名`
3. 填写签名信息（如"恏淘车平台"）
4. 提交审核（通常1-2小时）

#### 3. 申请短信模板
1. 进入短信服务控制台 → 国内消息 → 模板管理
2. 点击 `添加模板`
3. 模板内容示例：
   ```
   【恏淘车平台】新车行注册申请：${title}，${content}。请及时登录平台审核。
   ```
4. 提交审核（通常1-2小时）

#### 4. 获取 Access Key
1. 进入阿里云控制台 → AccessKey 管理
2. 创建 AccessKey
3. **保存 AccessKey ID 和 AccessKey Secret**（仅显示一次）

#### 5. 配置环境变量
在 Supabase 项目中配置环境变量：

1. 登录 Supabase Dashboard
2. 进入项目 → Settings → Edge Functions
3. 添加以下环境变量：
   - `SMS_ACCESS_KEY_ID`：阿里云 AccessKey ID
   - `SMS_ACCESS_KEY_SECRET`：阿里云 AccessKey Secret
   - `SMS_SIGN_NAME`：短信签名（如"恏淘车平台"）
   - `SMS_TEMPLATE_CODE`：短信模板代码（如"SMS_123456789"）
   - `ADMIN_PHONE`：平台管理员手机号（如"13800138000"）

#### 6. 修改通知类型
在 `src/pages/DealershipRegister.tsx` 中修改通知类型：

```typescript
const { data: notificationResult, error: notificationError } = await supabase.functions.invoke('send-notification', {
  body: {
    title: '🔔 新车行注册申请',
    content: notificationContent,
    notificationType: 'sms', // 改为 'sms' 或 'both'（同时发送企业微信和短信）
  },
});
```

#### 7. 实现短信发送逻辑
短信发送需要根据具体的短信服务商 API 进行实现。目前 Edge Function 中提供了接口框架，需要补充具体的 API 调用代码。

**阿里云短信 API 文档：** https://help.aliyun.com/document_detail/101414.html

---

## 三、通知类型说明

在调用通知服务时，可以通过 `notificationType` 参数指定通知类型：

- `'wechat'`：仅发送企业微信通知（默认）
- `'sms'`：仅发送短信通知
- `'both'`：同时发送企业微信和短信通知

### 示例代码
```typescript
await supabase.functions.invoke('send-notification', {
  body: {
    title: '通知标题',
    content: '通知内容',
    notificationType: 'wechat', // 或 'sms' 或 'both'
  },
});
```

---

## 四、故障排查

### 企业微信通知未收到
1. 检查 `WECHAT_WEBHOOK_URL` 环境变量是否配置正确
2. 检查 Webhook URL 是否有效（可以在企业微信群机器人设置中查看）
3. 查看 Edge Function 日志：Supabase Dashboard → Edge Functions → send-notification → Logs
4. 确认群机器人未被移除

### 短信通知未收到
1. 检查所有短信相关环境变量是否配置正确
2. 确认短信签名和模板已审核通过
3. 确认 AccessKey 有短信发送权限
4. 检查手机号格式是否正确
5. 查看阿里云短信服务控制台的发送记录

### 查看日志
在 Supabase Dashboard 中查看 Edge Function 日志：
1. 进入项目 → Edge Functions
2. 点击 `send-notification`
3. 查看 Logs 标签页

---

## 五、成本估算

### 企业微信群机器人
- **费用：** 完全免费
- **限制：** 每个机器人每分钟最多发送20条消息

### 短信通知（阿里云）
- **费用：** 约 0.045 元/条
- **预估：** 假设每天10个新车行注册，每月费用约 13.5 元

---

## 六、推荐配置

### 小型平台（每天 < 10 个注册）
- ✅ 仅使用企业微信群机器人
- 💰 成本：免费

### 中型平台（每天 10-50 个注册）
- ✅ 企业微信群机器人（主要）
- ✅ 短信通知（备用）
- 💰 成本：约 50-100 元/月

### 大型平台（每天 > 50 个注册）
- ✅ 企业微信群机器人 + 短信通知（同时发送）
- 💰 成本：约 100-300 元/月

---

## 七、技术支持

如有问题，请查看：
1. Edge Function 日志
2. 浏览器控制台日志
3. Supabase 项目日志

或联系技术支持团队。
