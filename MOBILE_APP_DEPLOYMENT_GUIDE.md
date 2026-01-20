# 📱 手机App安装操作手册

## 🚀 部署步骤

### 1. 构建生产版本

```bash
cd /workspace/app-8u0242wc45c1
npm run build
```

构建完成后，会在`dist`目录生成所有文件。

### 2. 部署到服务器

#### 方案A：使用Vercel（推荐，最简单）

1. 安装Vercel CLI：
```bash
npm install -g vercel
```

2. 登录Vercel：
```bash
vercel login
```

3. 部署：
```bash
vercel --prod
```

4. 完成！Vercel会给您一个HTTPS网址，例如：
```
https://your-app.vercel.app
```

#### 方案B：使用Netlify

1. 安装Netlify CLI：
```bash
npm install -g netlify-cli
```

2. 登录Netlify：
```bash
netlify login
```

3. 部署：
```bash
netlify deploy --prod --dir=dist
```

#### 方案C：使用自己的服务器

1. 将`dist`目录的所有文件上传到服务器

2. 配置Nginx（示例）：
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/your-app/dist;
    index index.html;
    
    # PWA支持
    location /manifest.json {
        add_header Cache-Control "public, max-age=0";
    }
    
    location /sw.js {
        add_header Cache-Control "public, max-age=0";
    }
    
    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. 重启Nginx：
```bash
sudo systemctl restart nginx
```

## 📱 用户安装指南

部署完成后，将以下安装指南发送给用户：

---

## 📲 iOS用户安装步骤

### 方法：使用Safari浏览器

1. **打开Safari浏览器**
   - 在iPhone或iPad上打开Safari（必须是Safari，不能用Chrome）

2. **访问系统网址**
   ```
   https://your-domain.com
   ```

3. **点击分享按钮**
   - 点击底部中间的"分享"按钮（方框带向上箭头的图标）
   
   ![iOS分享按钮](https://via.placeholder.com/300x100/2563eb/ffffff?text=点击底部分享按钮)

4. **添加到主屏幕**
   - 向下滚动菜单
   - 找到并点击"添加到主屏幕"
   
   ![添加到主屏幕](https://via.placeholder.com/300x100/2563eb/ffffff?text=添加到主屏幕)

5. **确认添加**
   - 可以修改App名称（默认：车行管理）
   - 点击右上角"添加"按钮
   
   ![确认添加](https://via.placeholder.com/300x100/2563eb/ffffff?text=点击添加)

6. **完成！**
   - 在主屏幕上找到蓝色的App图标
   - 点击即可使用

### iOS注意事项

⚠️ **必须使用Safari浏览器**
- Chrome、Firefox等其他浏览器不支持iOS上的PWA安装
- 如果用其他浏览器打开，请复制网址到Safari

✅ **安装成功标志**
- 主屏幕出现蓝色图标（白色车辆图案）
- 点击后全屏打开，没有浏览器地址栏
- 顶部状态栏是蓝色

---

## 📲 Android用户安装步骤

### 方法一：自动提示安装（推荐）

1. **打开Chrome浏览器**
   - 在Android手机上打开Chrome浏览器

2. **访问系统网址**
   ```
   https://your-domain.com
   ```

3. **等待安装提示**
   - 页面加载后，底部会自动弹出安装提示卡片
   - 显示"安装应用"和应用优势
   
   ![安装提示](https://via.placeholder.com/300x150/2563eb/ffffff?text=自动安装提示)

4. **点击"立即安装"**
   - 点击卡片上的"立即安装"按钮
   - 确认安装

5. **完成！**
   - 在应用抽屉或主屏幕找到App图标
   - 点击即可使用

### 方法二：手动安装

如果没有看到自动提示：

1. **打开Chrome浏览器**并访问系统网址

2. **点击右上角菜单**
   - 点击右上角的三个点（⋮）

3. **选择"安装应用"**
   - 在菜单中找到"安装应用"或"添加到主屏幕"
   
   ![Chrome菜单](https://via.placeholder.com/300x150/2563eb/ffffff?text=点击安装应用)

4. **确认安装**
   - 点击"安装"按钮

5. **完成！**

### Android注意事项

✅ **推荐使用Chrome浏览器**
- Chrome体验最佳，支持所有PWA功能
- 其他浏览器可能功能受限

✅ **安装成功标志**
- 应用抽屉中出现App图标
- 可以在设置中看到已安装的应用
- 支持后台运行和通知

---

## 🎯 安装后的使用

### 快捷方式

长按App图标，会显示快捷方式：

- **仪表盘**：快速查看业务概览
- **车辆管理**：直接进入车辆管理页面
- **销售管理**：快速记录销售信息
- **客户展示**：展示在售车辆给客户

### 离线功能

以下功能支持离线访问：

- ✅ 查看已缓存的车辆信息
- ✅ 浏览历史销售记录
- ✅ 查看统计图表
- ❌ 添加/编辑数据需要网络连接

### 推送通知

首次打开App时，会询问是否允许通知：

- 点击"允许"可以接收：
  - 📊 每日销售统计
  - 🚗 新车辆入库提醒
  - 💰 销售成交通知
  - 📅 重要事项提醒

---

## ❓ 常见问题

### Q1: 安装提示没有出现怎么办？

**原因可能是：**
- 使用了错误的浏览器
- 已经安装过
- 网站不是HTTPS

**解决方法：**
1. iOS：确保使用Safari浏览器
2. Android：确保使用Chrome浏览器
3. 清除浏览器缓存后重试
4. 使用手动安装方法

### Q2: 安装后找不到图标？

**iOS：**
- 检查主屏幕所有页面
- 图标可能在最后一页
- 搜索"车行管理"

**Android：**
- 打开应用抽屉查看
- 或在主屏幕搜索

### Q3: 如何卸载App？

**iOS：**
- 长按图标
- 选择"删除App"
- 确认删除

**Android：**
- 长按图标，拖到"卸载"
- 或在设置 > 应用中卸载

### Q4: App会自动更新吗？

✅ **会的！**
- PWA会在后台自动更新
- 重新打开App时加载最新版本
- 无需手动更新

### Q5: 占用多少空间？

- 初始安装：约5-10MB
- 缓存数据：10-50MB（根据使用情况）
- 总计：通常不超过100MB

### Q6: 多个设备可以同时使用吗？

✅ **可以！**
- 支持多设备同时登录
- 数据实时同步
- 每个设备独立缓存

---

## 📊 性能优化建议

### 首次安装后

1. **浏览所有主要页面**
   - 让系统缓存数据
   - 这样离线时也能访问

2. **启用通知**
   - 接收重要消息提醒
   - 不会错过重要信息

### 日常使用

1. **定期清理缓存**（如果App变慢）
   - iOS：设置 > Safari > 清除历史记录
   - Android：设置 > 应用 > 车行管理 > 清除缓存

2. **网络环境**
   - 首次加载建议使用WiFi
   - 后续使用4G/5G也很流畅

---

## 🎉 享受移动办公的便利！

安装完成后，您可以：

- 📱 像使用原生App一样使用系统
- 🚀 快速启动，无需打开浏览器
- 📴 部分功能支持离线使用
- 🔔 接收重要消息推送
- 💼 随时随地管理业务

如有任何问题，请联系技术支持！
