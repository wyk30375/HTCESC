# 🚀 5分钟快速配置企业微信通知

## 第一步：创建企业微信群（1分钟）
1. 打开企业微信
2. 创建一个新群聊，命名为"平台管理通知群"
3. 将需要接收通知的管理员拉入群聊

## 第二步：添加群机器人（2分钟）
1. 在群聊中点击右上角 `···`
2. 选择 `群机器人`
3. 点击 `添加机器人`
4. 输入机器人名称：`车行注册通知`
5. 点击 `添加`
6. **复制 Webhook 地址**（重要！）
   - 格式：`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxxx`

## 第三步：配置 Supabase 环境变量（2分钟）
1. 登录 Supabase Dashboard：https://supabase.com/dashboard
2. 选择您的项目
3. 进入 `Settings` → `Edge Functions`
4. 点击 `Add new secret`
5. 添加环境变量：
   - **Name:** `WECHAT_WEBHOOK_URL`
   - **Value:** 粘贴第二步复制的 Webhook 地址
6. 点击 `Save`

## 第四步：测试通知（1分钟）
1. 访问车行注册页面
2. 填写表单并提交注册
3. 查看企业微信群是否收到通知消息

## ✅ 完成！

现在每当有新车行注册时，企业微信群都会收到实时通知消息。

---

## 📱 通知消息示例

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

## ❓ 常见问题

### Q: 没有收到通知消息？
A: 请检查：
1. Webhook URL 是否配置正确
2. 群机器人是否被移除
3. 查看 Supabase Edge Functions 日志

### Q: 如何查看日志？
A: Supabase Dashboard → Edge Functions → send-notification → Logs

### Q: 如何添加短信通知？
A: 请查看 `NOTIFICATION_SETUP.md` 文档中的详细说明

---

## 📚 更多配置选项

如需配置短信通知或其他高级功能，请查看完整文档：
- `NOTIFICATION_SETUP.md` - 完整配置指南
- `supabase/functions/send-notification/index.ts` - Edge Function 源代码
