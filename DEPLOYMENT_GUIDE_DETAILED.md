# 二手车销售管理系统 - 完整部署指南（详细版）

> 📌 **本文档提供了从零开始部署系统的完整步骤，包括服务器购买、环境配置、域名设置等详细说明。**

## 📋 目录

- [一、应用架构说明](#一应用架构说明)
- [二、部署方案对比](#二部署方案对比)
- [三、推荐方案详细步骤](#三推荐方案详细步骤)
- [四、成本分析](#四成本分析)
- [五、安全加固](#五安全加固)
- [六、监控和维护](#六监控和维护)
- [七、常见问题解答](#七常见问题解答)
- [八、部署检查清单](#八部署检查清单)

---

## 一、应用架构说明

### 1.1 技术栈组成

**前端部分：**
- React 18 + TypeScript + Vite
- 静态资源（HTML、CSS、JS）
- 构建后生成 `dist/` 目录
- 需要 Web 服务器托管

**后端部分：**
- Supabase（云服务）
  - PostgreSQL 数据库
  - 用户认证系统
  - 文件存储（图片上传）
  - 实时订阅（可选）
  - Edge Functions（服务端函数）

**部署架构：**
```
用户浏览器
    ↓
前端服务器（托管静态文件）
    ↓
Supabase 云服务（API + 数据库）
```

### 1.2 部署需求

**前端需求：**
- Web 服务器（Nginx、Apache 或云托管）
- 支持 HTTPS
- 支持 SPA（单页应用）路由

**后端需求：**
- Supabase 账号（免费或付费）
- 数据库已配置完成
- API 密钥已设置

---

## 二、部署方案对比

### 方案一：Vercel + Supabase（推荐新手）

**优点：**
- ✅ 完全免费（小规模使用）
- ✅ 自动部署（Git 推送即部署）
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS 证书
- ✅ 零运维成本
- ✅ 5分钟完成部署

**缺点：**
- ❌ 免费版有流量限制（100GB/月）
- ❌ 免费版有构建时间限制
- ❌ 不适合大流量应用

**适用场景：**
- 初创车行（日访问量 < 1000）
- 测试和演示环境
- 预算有限的小型车行

**成本：**
- 免费版：0元/月
- Pro版：$20/月（约140元）

---

### 方案二：阿里云/腾讯云服务器 + Supabase（⭐ 推荐中小企业）

**优点：**
- ✅ 完全可控
- ✅ 性能稳定
- ✅ 可以部署多个应用
- ✅ 适合中国用户访问
- ✅ 可以自定义配置

**缺点：**
- ❌ 需要购买服务器
- ❌ 需要配置和维护
- ❌ 需要一定技术能力

**适用场景：**
- 中型车行（日访问量 1000-10000）
- 需要稳定服务
- 有一定技术团队

**成本：**
- 服务器：300-800元/年（入门配置）
- 域名：50-100元/年
- 总计：约400-1000元/年

---

### 方案三：全栈云服务器（自建数据库）

**优点：**
- ✅ 数据完全自主可控
- ✅ 不依赖第三方服务
- ✅ 可以内网部署
- ✅ 适合大型企业

**缺点：**
- ❌ 成本最高
- ❌ 需要专业运维
- ❌ 配置复杂

**适用场景：**
- 大型车行集团
- 对数据安全要求极高
- 有专业技术团队

**成本：**
- 服务器：2000-5000元/年
- 数据库维护：需要专人
- 总计：约5000-10000元/年

---

## 三、推荐方案详细步骤

> 以下是**方案二：阿里云 + Supabase**的详细部署步骤，这是最适合中小型车行的方案。

### 步骤1：购买服务器

#### 1.1 选择云服务商

- **阿里云**：https://www.aliyun.com
- **腾讯云**：https://cloud.tencent.com
- **华为云**：https://www.huaweicloud.com

#### 1.2 推荐配置（入门级）

| 配置项 | 推荐值 |
|--------|--------|
| CPU | 2核 |
| 内存 | 2GB |
| 硬盘 | 40GB SSD |
| 带宽 | 1-3Mbps |
| 操作系统 | Ubuntu 22.04 LTS 或 CentOS 7 |
| 价格 | 约300-500元/年（新用户优惠） |

#### 1.3 购买步骤

1. 注册账号并实名认证
2. 选择"云服务器 ECS"
3. 选择地域（建议选择离用户最近的）
4. 选择配置（按上述推荐配置）
5. 选择操作系统（Ubuntu 22.04）
6. 设置root密码（**务必记住**）
7. 购买时长（建议1年，更优惠）
8. 完成支付

---

### 步骤2：配置服务器环境

#### 2.1 连接到服务器

**Windows用户：**
- 下载 PuTTY 或 Xshell
- 输入服务器IP地址
- 使用root账号和密码登录

**Mac/Linux用户：**
```bash
ssh root@你的服务器IP
# 输入密码
```

#### 2.2 更新系统

```bash
# Ubuntu系统
sudo apt update
sudo apt upgrade -y

# CentOS系统
sudo yum update -y
```

#### 2.3 安装Nginx（Web服务器）

```bash
# Ubuntu
sudo apt install nginx -y

# CentOS
sudo yum install nginx -y

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 检查状态
sudo systemctl status nginx
```

#### 2.4 安装Node.js（用于构建前端）

```bash
# 安装nvm（Node版本管理器）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载配置
source ~/.bashrc

# 安装Node.js 18
nvm install 18
nvm use 18

# 验证安装
node -v
npm -v
```

#### 2.5 安装pnpm（包管理器）

```bash
npm install -g pnpm
pnpm -v
```

---

### 步骤3：准备前端代码

#### 3.1 在本地构建前端

在你的开发电脑上：

```bash
# 进入项目目录
cd /workspace/app-8u0242wc45c1

# 安装依赖（如果还没安装）
pnpm install

# 配置环境变量
# 创建 .env.production 文件
cat > .env.production << 'EOF'
VITE_SUPABASE_URL=你的Supabase项目URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
VITE_APP_ID=你的应用ID
VITE_API_ENV=production
EOF

# 构建生产版本
npm run build

# 构建完成后，会生成 dist/ 目录
```

#### 3.2 上传到服务器

**方法1：使用SCP（推荐）**

```bash
# 在本地电脑上执行
# 将dist目录打包
tar -czf dist.tar.gz dist/

# 上传到服务器
scp dist.tar.gz root@你的服务器IP:/root/

# 在服务器上解压
ssh root@你的服务器IP
cd /root
tar -xzf dist.tar.gz
```

**方法2：使用FTP工具**
- 下载 FileZilla 或 WinSCP
- 连接到服务器
- 上传 `dist/` 目录

---

### 步骤4：配置Nginx

#### 4.1 创建网站目录

```bash
# 创建网站根目录
sudo mkdir -p /var/www/car-management

# 移动前端文件
sudo mv /root/dist/* /var/www/car-management/

# 设置权限
sudo chown -R www-data:www-data /var/www/car-management
sudo chmod -R 755 /var/www/car-management
```

#### 4.2 配置Nginx站点

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/car-management
```

粘贴以下配置：

```nginx
server {
    listen 80;
    server_name 你的域名或IP;  # 例如：car.example.com 或 123.456.789.0
    
    root /var/www/car-management;
    index index.html;
    
    # 启用gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 4.3 启用站点

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/car-management /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

---

### 步骤5：配置域名（可选但推荐）

#### 5.1 购买域名

- **阿里云**：https://wanwang.aliyun.com
- **腾讯云**：https://dnspod.cloud.tencent.com
- **价格**：50-100元/年

**推荐域名：**
- car-manage.com
- yourcompany-car.com
- 你的车行名-car.cn

#### 5.2 域名解析

1. 登录域名管理后台
2. 添加A记录：
   - 主机记录：`@` 或 `www`
   - 记录类型：`A`
   - 记录值：你的服务器IP
   - TTL：10分钟
3. 等待解析生效（通常5-30分钟）

---

### 步骤6：配置HTTPS（强烈推荐）

#### 6.1 安装Certbot（免费SSL证书）

```bash
# Ubuntu
sudo apt install certbot python3-certbot-nginx -y

# CentOS
sudo yum install certbot python3-certbot-nginx -y
```

#### 6.2 获取SSL证书

```bash
# 自动配置HTTPS
sudo certbot --nginx -d 你的域名

# 按提示操作：
# 1. 输入邮箱
# 2. 同意服务条款
# 3. 选择是否重定向HTTP到HTTPS（推荐选择2）
```

#### 6.3 自动续期

```bash
# 测试自动续期
sudo certbot renew --dry-run

# 设置定时任务（每天检查）
sudo crontab -e

# 添加以下行：
0 3 * * * certbot renew --quiet
```

---

### 步骤7：配置Supabase

#### 7.1 创建Supabase项目

1. 访问 https://supabase.com
2. 注册/登录账号
3. 点击"New Project"
4. 填写项目信息：
   - Name：`car-management`
   - Database Password：设置强密码（**务必保存**）
   - Region：选择离中国最近的（Singapore）
5. 等待项目创建（约2分钟）

#### 7.2 获取API密钥

1. 进入项目设置（Settings）
2. 点击"API"
3. 复制以下信息：
   - Project URL
   - anon public key

#### 7.3 导入数据库结构

1. 点击"SQL Editor"
2. 上传你的迁移文件（`supabase/migrations/`）
3. 或者直接粘贴SQL代码执行

#### 7.4 配置存储桶（图片上传）

1. 点击"Storage"
2. 创建bucket：`vehicle-photos`
3. 设置为public（公开访问）
4. 配置CORS策略

---

### 步骤8：更新前端配置

#### 8.1 更新环境变量

```bash
# 在服务器上编辑配置
cd /var/www/car-management

# 如果使用的是构建时环境变量，需要重新构建
# 在本地更新 .env.production 后重新构建上传
```

#### 8.2 验证配置

1. 打开浏览器
2. 访问 `http://你的域名` 或 `http://你的IP`
3. 测试登录功能
4. 测试数据录入
5. 测试图片上传

---

### 步骤9：配置防火墙

#### 9.1 云服务器安全组

1. 登录云服务商控制台
2. 找到"安全组"设置
3. 添加规则：
   - 入方向：
     - HTTP：80端口
     - HTTPS：443端口
     - SSH：22端口（仅允许你的IP）

#### 9.2 服务器防火墙

```bash
# Ubuntu (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# CentOS (Firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

---

### 步骤10：性能优化

#### 10.1 启用HTTP/2

```bash
# 编辑Nginx配置
sudo nano /etc/nginx/sites-available/car-management

# 修改listen行：
listen 443 ssl http2;
```

#### 10.2 配置缓存

```nginx
# 在server块中添加：
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 10.3 启用Brotli压缩（可选）

```bash
# 安装Brotli模块
sudo apt install nginx-module-brotli -y

# 在Nginx配置中启用
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

---

## 四、成本分析

### 方案二（阿里云 + Supabase）详细成本

#### 一次性成本

| 项目 | 费用 |
|------|------|
| 域名注册 | 50-100元/年 |
| SSL证书 | 0元（Let's Encrypt免费） |
| 初始配置 | 0元（自己配置）或 500-1000元（找人配置） |

#### 年度成本

| 项目 | 费用 |
|------|------|
| 云服务器 | 300-800元/年 |
| 域名续费 | 50-100元/年 |
| Supabase | 0-300元/年（免费版通常够用） |
| **总计** | **约400-1200元/年** |

#### 流量成本（按使用量）

- 免费额度：通常包含1TB/月
- 超出部分：约0.8元/GB

#### 适用规模

- 支持10-50个并发用户
- 日访问量1000-5000次
- 存储车辆数据1000-5000条
- 图片存储10-50GB

---

## 五、安全加固

### 5.1 服务器安全

#### 1. 修改SSH端口

```bash
sudo nano /etc/ssh/sshd_config
# 修改 Port 22 为其他端口（如 2222）
sudo systemctl restart sshd
```

#### 2. 禁用root远程登录

```bash
# 创建普通用户
sudo adduser admin
sudo usermod -aG sudo admin

# 禁用root登录
sudo nano /etc/ssh/sshd_config
# 设置 PermitRootLogin no
```

#### 3. 安装Fail2ban（防暴力破解）

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 5.2 应用安全

1. **配置Supabase RLS（行级安全）**
   - 确保所有表都启用RLS
   - 配置合理的访问策略
   - 定期审查权限

2. **环境变量保护**
   - 不要在前端暴露敏感信息
   - 使用Supabase Edge Functions处理敏感操作

3. **定期更新**
```bash
# 每月更新一次系统
sudo apt update && sudo apt upgrade -y
```

---

## 六、监控和维护

### 6.1 服务器监控

#### 安装监控工具

```bash
# 安装htop（实时监控）
sudo apt install htop -y

# 查看系统资源
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 6.2 日志管理

#### 查看Nginx日志

```bash
# 访问日志
sudo tail -f /var/log/nginx/access.log

# 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 6.3 数据备份

#### Supabase自动备份

- 免费版：每日自动备份，保留7天
- Pro版：每日自动备份，保留30天
- 可以手动导出数据库

#### 服务器备份

```bash
# 备份网站文件
tar -czf website-backup-$(date +%Y%m%d).tar.gz /var/www/car-management

# 定期备份脚本
cat > /root/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/website-$(date +%Y%m%d).tar.gz /var/www/car-management
# 删除30天前的备份
find $BACKUP_DIR -name "website-*.tar.gz" -mtime +30 -delete
EOF

chmod +x /root/backup.sh

# 添加定时任务（每天凌晨3点备份）
crontab -e
# 添加：0 3 * * * /root/backup.sh
```

---

## 七、常见问题解答

### Q1: 部署后访问很慢怎么办？

**解决方案：**
1. 检查服务器带宽（建议至少3Mbps）
2. 启用Nginx gzip压缩
3. 配置CDN加速（阿里云CDN、腾讯云CDN）
4. 优化图片大小（压缩后再上传）
5. 选择离用户更近的服务器地域

### Q2: 如何扩容？

**解决方案：**
1. 升级服务器配置（CPU、内存、带宽）
2. 升级Supabase套餐（Pro版）
3. 使用负载均衡（多台服务器）
4. 使用CDN加速静态资源

### Q3: 数据库满了怎么办？

**解决方案：**
1. Supabase免费版：500MB数据库
2. 升级到Pro版：8GB数据库
3. 定期清理旧数据
4. 图片使用压缩和CDN

### Q4: 如何更新应用？

**解决方案：**
1. 在本地修改代码
2. 重新构建：`npm run build`
3. 上传新的dist目录到服务器
4. 替换旧文件
5. 清除浏览器缓存

### Q5: 忘记服务器密码怎么办？

**解决方案：**
1. 登录云服务商控制台
2. 找到"重置密码"功能
3. 重启服务器后生效

### Q6: 网站被攻击怎么办？

**解决方案：**
1. 启用云服务商的DDoS防护
2. 配置Web应用防火墙（WAF）
3. 限制API请求频率
4. 定期更新系统和软件
5. 备份重要数据

---

## 八、部署检查清单

### 部署前检查

- [ ] 服务器已购买并可访问
- [ ] 域名已购买并解析（可选）
- [ ] Supabase项目已创建
- [ ] 数据库结构已导入
- [ ] 环境变量已配置
- [ ] 前端代码已构建

### 部署后检查

- [ ] 网站可以正常访问
- [ ] HTTPS证书已配置
- [ ] 登录功能正常
- [ ] 数据录入功能正常
- [ ] 图片上传功能正常
- [ ] 移动端访问正常
- [ ] 性能测试通过
- [ ] 备份策略已设置

---

## 九、推荐学习资源

### 服务器管理

- 阿里云大学：https://edu.aliyun.com
- 腾讯云开发者实验室：https://cloud.tencent.com/developer/labs

### Nginx配置

- Nginx官方文档：https://nginx.org/en/docs/
- Nginx配置生成器：https://nginxconfig.io

### Supabase

- 官方文档：https://supabase.com/docs
- 中文社区：https://supabase.com/docs/guides/getting-started

---

## 十、技术支持

### 云服务商技术支持

- **阿里云**：95187
- **腾讯云**：95716

### Supabase支持

- Discord社区：https://discord.supabase.com
- GitHub Issues：https://github.com/supabase/supabase

### 社区求助

- Stack Overflow
- V2EX
- SegmentFault

---

## 🎯 总结

### 推荐部署方案：阿里云服务器 + Supabase

**优势：**
- ✅ 成本低（约400-1000元/年）
- ✅ 性能稳定
- ✅ 适合中国用户
- ✅ 易于维护
- ✅ 可扩展性强

**部署时间：**
- 首次部署：2-4小时
- 熟练后：30分钟

**技术要求：**
- 基础Linux命令
- 基础网络知识
- 按照本指南操作即可

**适用规模：**
- 1-10家车行
- 10-50个用户
- 1000-5000条车辆数据

**这个方案可以满足大多数中小型车行的需求，性价比最高！**

---

## 📞 联系方式

如有任何问题，欢迎通过以上技术支持渠道联系。

---

**文档版本：** v1.0  
**最后更新：** 2026-01-10  
**适用系统：** 二手车销售管理系统
