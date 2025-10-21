# 🔧 认证问题故障排除指南

## ❌ 错误: "Invalid login credentials"

这个错误表示 Supabase 无法验证您的登录凭证。以下是可能的原因和解决方案：

---

## 📋 检查清单

### 1. 检查 Supabase 项目配置

#### ✅ 验证环境变量

在 `.env.local` 文件中检查：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://aawmqxkxdpjhaxpxpgnu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**如何获取这些值**：
1. 登录 https://supabase.com
2. 选择您的项目
3. 点击 Settings → API
4. 复制 "Project URL" 和 "anon public" key

#### ✅ 重启开发服务器

更改 `.env.local` 后必须重启：
```bash
# 停止当前服务器 (Ctrl+C)
npm run dev
```

---

### 2. 检查用户是否存在

#### 方法 A: 使用调试工具

1. 访问: http://localhost:3000/debug-auth
2. 输入邮箱和密码
3. 点击 "Check Environment" - 验证配置
4. 点击 "Test Sign Up" - 尝试注册
5. 点击 "Test Sign In" - 尝试登录

#### 方法 B: 在 Supabase 控制台检查

1. 访问 Supabase 控制台
2. 点击 "Authentication" → "Users"
3. 查看用户列表
4. 如果没有用户，需要先注册

---

### 3. 检查 Supabase 认证设置

#### ✅ 确认 Email 认证已启用

1. Supabase 控制台 → Authentication → Providers
2. 确保 "Email" 已启用
3. 检查 "Email Auth" 设置：
   - ✅ Enable email confirmations（如果启用，用户必须验证邮箱）
   - ✅ Secure email change（推荐启用）

#### ⚠️ 邮箱确认问题

如果启用了 "Enable email confirmations"：
- 用户注册后需要点击验证邮件中的链接
- 在验证前无法登录
- **临时解决方案**：在开发阶段可以暂时禁用邮箱确认

**禁用邮箱确认（仅开发环境）**：
1. Supabase 控制台 → Authentication → Settings
2. 找到 "Email Auth"
3. 取消勾选 "Enable email confirmations"
4. 点击 Save

---

### 4. 检查数据库设置

#### ✅ 确认数据库表已创建

1. Supabase 控制台 → SQL Editor
2. 执行以下查询检查表是否存在：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'social_authorizations', 'content_events', 'publishing_history');
```

如果没有返回结果，需要执行 `supabase_setup.sql`。

#### ✅ 检查触发器是否存在

```sql
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

如果没有结果，重新执行 `supabase_setup.sql`。

---

### 5. 常见场景和解决方案

#### 场景 A: 首次使用，从未注册过

**解决方案**：
1. 访问 http://localhost:3000/signup
2. 注册一个新账号
3. 如果启用了邮箱验证，检查邮箱
4. 点击验证链接
5. 返回登录页登录

#### 场景 B: 已经注册但忘记密码

**解决方案**：
1. 点击登录页的 "Forgot password?"
2. 输入邮箱
3. 检查邮件中的重置链接
4. 设置新密码

#### 场景 C: 确定凭证正确但仍然失败

**可能原因**：
- 邮箱未验证（如果启用了验证功能）
- 用户在 Supabase 中被禁用
- RLS 策略问题

**解决方案**：
1. 在 Supabase 控制台检查用户状态
2. 确认用户的 "Email Confirmed" 是 Yes
3. 检查用户的 "Status" 是 Active

---

## 🔬 调试步骤

### 步骤 1: 使用调试工具

```bash
# 访问调试页面
http://localhost:3000/debug-auth
```

依次点击：
1. **Check Environment** - 查看配置是否正确
2. **Test DB Connection** - 确认数据库连接
3. **Test Sign Up** - 注册测试账号
4. **Test Sign In** - 测试登录

### 步骤 2: 检查浏览器控制台

打开浏览器开发者工具（F12）：
- 查看 Console 标签的错误信息
- 查看 Network 标签的 API 请求
- 检查请求的 Headers 和 Response

### 步骤 3: 在 Supabase 中手动创建测试用户

1. Supabase 控制台 → Authentication → Users
2. 点击 "Add user" → "Create new user"
3. 输入：
   - Email: test@example.com
   - Password: Test123456!
   - ✅ Auto Confirm User (勾选此项跳过邮箱验证)
4. 点击 "Create user"
5. 尝试使用这个账号登录

---

## 🛠️ 快速修复脚本

如果您想快速重置所有设置，在 Supabase SQL Editor 执行：

```sql
-- 删除所有用户数据（小心！这会删除所有数据）
TRUNCATE TABLE public.publishing_history CASCADE;
TRUNCATE TABLE public.content_events CASCADE;
TRUNCATE TABLE public.social_authorizations CASCADE;
TRUNCATE TABLE public.user_profiles CASCADE;

-- 如果需要，也可以删除 auth.users 中的用户
-- 注意：这需要在 Supabase 控制台的 Authentication → Users 中手动删除
```

然后重新注册用户。

---

## 📝 测试用例

### 创建测试账号

使用以下步骤创建一个测试账号：

1. **访问调试页面**: http://localhost:3000/debug-auth
2. **输入测试邮箱**: test@example.com
3. **输入测试密码**: Test123456!
4. **点击 "Test Sign Up"**
5. **检查结果**:
   - 如果成功，会显示用户数据
   - 如果失败，查看错误信息

6. **点击 "Test Sign In"**
7. **检查结果**:
   - 成功：显示会话和用户信息
   - 失败：查看具体错误消息

---

## 🎯 最可能的解决方案

根据您的错误，最可能的原因是：

### 🥇 #1: 用户未注册

**解决方案**: 
```bash
# 访问注册页面
http://localhost:3000/signup
```
注册一个新账号

### 🥈 #2: 邮箱未验证

**解决方案**:
1. 检查邮箱中的验证链接
2. 或者在 Supabase 控制台临时禁用邮箱验证
3. 或者在 Supabase 控制台手动确认用户

### 🥉 #3: 密码错误

**解决方案**:
- 使用 "Forgot password" 重置密码
- 或者在 Supabase 控制台重置用户密码

---

## 📞 仍然有问题？

如果上述方法都不起作用：

1. **复制完整错误信息**
   - 浏览器控制台的错误
   - Network 标签的响应
   - Supabase 日志

2. **检查 Supabase 项目状态**
   - 确认项目没有暂停
   - 检查是否有配额限制

3. **尝试创建新的测试项目**
   - 在 Supabase 创建新项目
   - 重新执行设置步骤
   - 测试是否工作

---

## ✅ 验证修复

修复后，执行以下测试确认一切正常：

```bash
# 1. 访问调试页面
http://localhost:3000/debug-auth

# 2. 检查环境变量
点击 "Check Environment" → 应该显示正确的 URL

# 3. 测试数据库连接
点击 "Test DB Connection" → 不应该有错误

# 4. 注册新用户
输入邮箱和密码 → 点击 "Test Sign Up" → 应该成功

# 5. 登录测试
点击 "Test Sign In" → 应该返回用户会话

# 6. 访问实际登录页
http://localhost:3000/login → 使用刚注册的账号登录
```

如果所有步骤都成功，您的认证系统就正常工作了！ 🎉
