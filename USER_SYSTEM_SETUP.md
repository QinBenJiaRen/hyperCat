# 用户系统设置指南

## 🎯 概述

您的应用现在已经升级为完整的多用户 SaaS 系统！用户可以：
- 注册和登录账号
- 在任何设备上访问已授权的社交媒体账号
- 安全地存储授权令牌和内容
- 查看发布历史

## 📋 前置要求

1. **Supabase 账号** (免费)
   - 访问: https://supabase.com
   - 点击 "Start your project"
   - 创建一个新项目

## 🚀 设置步骤

### 步骤 1: 配置 Supabase

1. **创建项目**
   - 登录 Supabase 控制台
   - 创建新项目
   - 记录项目 URL 和 anon key

2. **执行数据库设置**
   - 在 Supabase 控制台，点击 "SQL Editor"
   - 打开项目中的 `supabase_setup.sql` 文件
   - 复制全部内容并粘贴到 SQL编辑器
   - 点击 "RUN" 执行

3. **配置身份验证**
   - 在 Supabase 控制台，点击 "Authentication" → "Providers"
   - 确保 "Email" 提供商已启用
   - (可选) 配置邮件模板以自定义注册邮件

### 步骤 2: 安装依赖

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

### 步骤 3: 配置环境变量

创建 `.env.local` 文件（或复制 `.env.example`）：

```bash
# Supabase 配置 (必需)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 应用 URL
NEXT_PUBLIC_URL=http://localhost:3000

# 社交媒体 OAuth (可选，用于生产模式)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
```

### 步骤 4: 启动应用

```bash
npm run dev
```

访问: http://localhost:3000

## 📊 数据库架构

已创建以下表：

### 1. `user_profiles`
- 用户基本信息
- 与 Supabase Auth 关联

### 2. `social_authorizations`
- 存储用户的社交媒体授权
- 包含访问令牌、刷新令牌、过期时间
- 支持: Instagram, Facebook, X

### 3. `content_events`
- 计划的内容发布事件
- 关联到用户和平台

### 4. `publishing_history`
- 记录所有发布操作
- 包含成功和失败的尝试

## 🔒 安全功能

### Row Level Security (RLS)
- ✅ 所有表都启用了 RLS
- ✅ 用户只能访问自己的数据
- ✅ 自动通过 Supabase Auth 验证

### 数据加密
- ✅ 令牌存储在安全的数据库中
- ✅ 使用 HTTP-only cookies 进行会话管理
- ✅ 自动处理令牌刷新

## 🎨 新功能

### 用户认证
- ✅ 注册页面 (`/signup`)
- ✅ 登录页面 (`/login`)
- ✅ 密码重置功能
- ✅ 邮箱验证

### 路由保护
- ✅ 未登录用户自动重定向到登录页
- ✅ 已登录用户访问 /login 会重定向到主页

### 用户资料
- ✅ 显示用户邮箱和姓名
- ✅ 登出按钮
- ✅ 头像占位符

### 社交媒体授权
- ✅ 授权信息存储在数据库
- ✅ 支持跨设备访问
- ✅ 令牌过期检测

## 📖 使用流程

### 新用户注册
1. 访问 `/signup`
2. 输入姓名、邮箱、密码
3. 收到验证邮件
4. 点击邮件中的链接验证
5. 登录应用

### 授权社交媒体
1. 登录后，进入内容创建页面
2. 生成内容
3. 点击 "Publish Now" 按钮
4. 如未授权，点击 "Connect Account"
5. 完成 OAuth 授权
6. 授权信息自动保存

### 跨设备使用
1. 在另一台设备登录相同账号
2. 社交媒体授权自动同步
3. 无需重新授权

## 🧪 测试

### 演示模式
无需配置 OAuth凭证即可测试：
- 注册/登录功能正常工作
- 授权流程使用模拟数据
- 发布操作模拟成功

### 生产模式
配置 OAuth 凭证后：
- 真实的社交媒体授权
- 实际发布到平台
- 令牌自动刷新

## 🔧 故障排除

### 问题: 无法注册用户
**解决方案**:
- 检查 Supabase 项目状态
- 验证 `.env.local` 中的凭证
- 检查 Supabase 认证设置

### 问题: 授权信息不持久
**解决方案**:
- 确认数据库表已创建
- 检查 RLS 策略是否正确
- 验证用户已登录

### 问题: 路由重定向循环
**解决方案**:
- 检查 middleware.ts 配置
- 清除浏览器 cookies
- 重新启动开发服务器

## 📚 API 文档

### 认证 API

#### POST /api/auth/signup
注册新用户

#### POST /api/auth/signin
用户登录

#### POST /api/auth/signout
用户登出

### 社交媒体 API

#### GET /api/social-auth/status?platform=instagram
检查授权状态

#### GET /api/social-auth/authorize?platform=instagram
启动 OAuth 流程

#### POST /api/social-auth/revoke?platform=instagram
撤销授权

#### POST /api/social-publish
发布内容到社交媒体

## 🎯 后续增强建议

1. **邮件验证流程优化**
   - 自定义验证邮件模板
   - 添加欢迎邮件

2. **用户资料管理**
   - 头像上传
   - 修改密码
   - 更新个人信息

3. **团队功能**
   - 多用户协作
   - 权限管理
   - 团队账号共享

4. **分析功能**
   - 发布统计
   - 内容表现追踪
   - 用户活动日志

5. **高级安全**
   - 两步验证 (2FA)
   - 登录历史
   - 设备管理

## 💡 最佳实践

1. **定期备份数据库**
   - 使用 Supabase 的自动备份功能
   - 导出重要数据

2. **监控令牌过期**
   - 实现自动刷新逻辑
   - 提醒用户重新授权

3. **错误处理**
   - 记录所有错误到日志
   - 提供用户友好的错误消息

4. **性能优化**
   - 使用数据库索引
   - 缓存常用查询
   - 优化 API 调用

## 📞 支持

如需帮助：
- Supabase 文档: https://supabase.com/docs
- Next.js 文档: https://nextjs.org/docs

## ✅ 检查清单

在部署到生产环境前：

- [ ] Supabase 项目已创建
- [ ] 数据库表已设置
- [ ] RLS 策略已启用
- [ ] 环境变量已配置
- [ ] OAuth 应用已注册（如需生产模式）
- [ ] 邮件验证已测试
- [ ] 所有功能已在演示模式下测试
- [ ] 生产环境 URL 已更新

祝使用愉快！ 🎉
