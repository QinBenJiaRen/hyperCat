# ✅ Stripe 已成功安装！

## 状态

✅ Stripe 依赖包已安装完成
✅ 所有 Stripe 代码已激活
✅ 无 TypeScript 编译错误

## 下一步：配置 Stripe

### 1. 获取 Stripe API 密钥

访问 [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

复制以下密钥：
- **Publishable key** (以 `pk_test_` 开头)
- **Secret key** (以 `sk_test_` 开头)

### 2. 配置环境变量

在项目根目录创建或编辑 `.env.local` 文件，添加：

```bash
# Stripe 配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_你的密钥
STRIPE_SECRET_KEY=sk_test_你的密钥
STRIPE_WEBHOOK_SECRET=whsec_将在第3步获取

# Supabase Service Role Key（用于 webhook）
SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key

# 应用 URL
NEXT_PUBLIC_URL=http://localhost:3001
```

**如何获取 Supabase Service Role Key：**
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Settings → API
4. 复制 "service_role" 密钥（⚠️ 保密！）

### 3. 设置 Stripe Webhook（本地开发）

**使用 Stripe CLI（推荐）：**

```bash
# 安装 Stripe CLI（macOS）
brew install stripe/stripe-cli/stripe

# 登录
stripe login

# 转发 webhook 到本地服务器
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

运行后会显示 webhook 签名密钥，复制到 `.env.local` 的 `STRIPE_WEBHOOK_SECRET`

### 4. 运行数据库迁移

在 [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) 中执行：

```sql
-- 1. 打开 SQL Editor
-- 2. 复制粘贴 add_subscription_fields.sql 的内容
-- 3. 点击 Run
```

验证：
```sql
SELECT * FROM public.user_profiles LIMIT 1;
-- 应该看到新字段：subscription_plan, subscription_status, stripe_customer_id, 等
```

### 5. 重启开发服务器

```bash
npm run dev
```

## 测试支付流程

1. 访问 `http://localhost:3001/membership`
2. 选择 Plus 或 Pro 计划
3. 输入邮箱，勾选同意条款
4. 点击 "Pay with Stripe"

### 测试信用卡号

使用 Stripe 提供的测试卡号：

| 卡号 | 结果 |
|------|------|
| 4242 4242 4242 4242 | ✅ 成功 |
| 4000 0000 0000 0002 | ❌ 卡被拒绝 |
| 4000 0000 0000 9995 | ⚠️ 资金不足 |

- **Expiry**: 任意未来日期（如 12/34）
- **CVC**: 任意 3 位数字（如 123）
- **ZIP**: 任意邮编

### 预期行为

1. 点击按钮后会显示加载状态
2. 跳转到 Stripe Checkout 页面
3. 输入测试卡号完成支付
4. 自动返回到 `/membership?success=true`
5. 显示 Step 3 成功页面

### 验证数据库

在 Supabase SQL Editor 中检查：

```sql
SELECT 
  email,
  subscription_plan,
  subscription_status,
  stripe_customer_id,
  stripe_subscription_id
FROM public.user_profiles
WHERE email = '你的测试邮箱';
```

应该看到：
- `subscription_plan`: "plus" 或 "pro"
- `subscription_status`: "active"
- `stripe_customer_id`: "cus_..."
- `stripe_subscription_id`: "sub_..."

## 生产环境部署

### 1. 切换到正式密钥

在生产环境的 `.env.local` 中使用：
- `pk_live_...` (Publishable key)
- `sk_live_...` (Secret key)

### 2. 配置生产 Webhook

1. 访问 [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. 点击 "Add endpoint"
3. 输入：`https://你的域名.com/api/stripe/webhook`
4. 选择事件：
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. 复制 Webhook 签名密钥到 `.env.local`

### 3. 更新 URL

```bash
NEXT_PUBLIC_URL=https://你的域名.com
```

## 价格配置

当前价格（在 `checkout/route.ts` 中）：

```typescript
const planPrices: Record<string, number> = {
  plus: 990,  // $9.90/月
  pro: 1990   // $19.90/月
}
```

要修改价格，编辑这些数值（单位：美分）。

## 故障排查

### 问题：Webhook 未收到事件

**解决方案：**
- 检查 `stripe listen` 是否还在运行
- 确认 `.env.local` 中的 `STRIPE_WEBHOOK_SECRET` 正确
- 查看终端的 Stripe CLI 输出

### 问题：支付后数据库未更新

**解决方案：**
- 检查 Supabase Service Role Key 是否正确
- 查看 webhook 路由的日志（`/api/stripe/webhook`）
- 确认数据库迁移已执行

### 问题：Unauthorized 401 错误

**解决方案：**
- 确保用户已登录
- 检查 Supabase session 是否有效

## 相关文档

- **STRIPE_SETUP.md** - 完整详细设置指南
- **QUICK_START.md** - 快速开始指南
- [Stripe 官方文档](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)

## 支持

遇到问题？检查：
1. 浏览器控制台错误
2. 终端服务器日志
3. Stripe Dashboard → Events (查看 webhook 事件)
4. Supabase Dashboard → Logs
