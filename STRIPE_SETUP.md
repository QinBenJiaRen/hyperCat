# Stripe 支付集成指南

## ✅ 已完成的工作

### 1. 代码修改
- ✅ 移除了 Full Name 字段（Stripe 不需要）
- ✅ 优化了 Payment Details 页面高度
- ✅ 创建了 Stripe 配置文件 (`src/lib/stripe.ts`)
- ✅ 创建了 Checkout API (`src/app/api/stripe/checkout/route.ts`)
- ✅ 创建了 Webhook 处理 (`src/app/api/stripe/webhook/route.ts`)
- ✅ 更新了 Membership 页面以支持 Stripe 支付
- ✅ 添加了支付处理逻辑和加载状态
- ✅ 创建了数据库迁移脚本

### 2. 需要手动完成的步骤

#### 步骤 1: 安装 Stripe 依赖包

```bash
npm install @stripe/stripe-js stripe
```

#### 步骤 2: 在 Supabase 中添加订阅字段

1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. 运行 `add_subscription_fields.sql` 文件中的 SQL 脚本

#### 步骤 3: 获取 Stripe API 密钥

1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 注册/登录账号
3. 进入 **Developers** → **API keys**
4. 复制以下密钥：
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

#### 步骤 4: 设置 Stripe Webhook

1. 在 Stripe Dashboard，进入 **Developers** → **Webhooks**
2. 点击 **Add endpoint**
3. 输入 Webhook URL:
   - 本地测试: `http://localhost:3001/api/stripe/webhook`
   - 生产环境: `https://your-domain.com/api/stripe/webhook`
4. 选择以下事件:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. 点击 **Add endpoint**
6. 复制 **Signing secret** (whsec_...)

#### 步骤 5: 配置环境变量

在 `.env.local` 文件中添加：

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Service Role Key (for webhook)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**获取 Supabase Service Role Key:**
1. 打开 Supabase Dashboard
2. 进入 **Settings** → **API**
3. 复制 **service_role** key（⚠️ 保密，仅用于服务器端）

#### 步骤 6: 本地测试 Webhook（可选）

使用 Stripe CLI 进行本地测试：

```bash
# 安装 Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# 登录
stripe login

# 转发 webhook 到本地
stripe listen --forward-to localhost:3001/api/stripe/webhook

# 这会生成一个 webhook secret，将其添加到 .env.local
```

#### 步骤 7: 测试支付流程

1. 启动开发服务器: `npm run dev`
2. 访问 Membership 页面
3. 选择 Plus 或 Pro 计划
4. 点击 "Continue"
5. 填写邮箱信息
6. 点击 "Pay with Stripe"
7. 在 Stripe Checkout 页面使用测试卡号:
   - **成功**: `4242 4242 4242 4242`
   - **需要验证**: `4000 0025 0000 3155`
   - **失败**: `4000 0000 0000 9995`
   - 过期日期: 任何未来日期 (如 12/34)
   - CVC: 任何 3 位数字 (如 123)

## 📋 Stripe 测试卡号

| 场景 | 卡号 | 说明 |
|------|------|------|
| 成功支付 | `4242 4242 4242 4242` | 标准测试卡 |
| 需要 3D 验证 | `4000 0025 0000 3155` | 需要额外验证 |
| 支付失败 | `4000 0000 0000 9995` | 总是失败 |
| 余额不足 | `4000 0000 0000 9995` | 卡被拒绝 |

## 🔄 支付流程

1. **用户选择计划** → Step 1
2. **填写支付信息** → Step 2
3. **点击 "Pay with Stripe"** → 调用 `/api/stripe/checkout`
4. **重定向到 Stripe Checkout** → 安全支付页面
5. **完成支付** → Stripe 处理支付
6. **Webhook 通知** → `/api/stripe/webhook` 更新数据库
7. **返回确认页面** → Step 3，显示成功消息

## 🎨 UI 优化

- ✅ 移除了 Full Name 字段
- ✅ 表单间距从 `space-y-3` 调整为 `space-y-2.5`
- ✅ 免费计划提示间距优化
- ✅ 添加了支付处理中的加载动画
- ✅ 按钮文字改为 "Pay with Stripe"
- ✅ 支付成功/取消自动处理

## 🔐 安全注意事项

1. **永远不要在客户端使用 Secret Key**
2. **验证 Webhook 签名**（已实现）
3. **使用 HTTPS**（生产环境必需）
4. **保护 Service Role Key**（仅服务器端使用）
5. **测试环境使用 test keys**
6. **生产环境使用 live keys**

## 📊 数据库字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `subscription_plan` | TEXT | 订阅计划: free, plus, pro |
| `subscription_status` | TEXT | 状态: active, canceled, past_due |
| `stripe_customer_id` | TEXT | Stripe 客户 ID |
| `stripe_subscription_id` | TEXT | Stripe 订阅 ID |
| `subscription_current_period_end` | TIMESTAMPTZ | 当前计费周期结束时间 |

## 🚀 上线前检查清单

- [ ] 安装 Stripe 依赖包
- [ ] 运行数据库迁移脚本
- [ ] 配置 Stripe API 密钥
- [ ] 设置 Webhook endpoint
- [ ] 测试支付流程
- [ ] 测试 Webhook 事件
- [ ] 验证订阅更新
- [ ] 验证订阅取消
- [ ] 切换到生产环境密钥
- [ ] 配置生产环境 Webhook URL

## 🎯 下一步

1. 运行 `npm install @stripe/stripe-js stripe`
2. 在 Supabase 中执行 SQL 迁移
3. 配置 Stripe Dashboard
4. 更新 `.env.local` 文件
5. 测试完整支付流程

完成这些步骤后，Stripe 支付就完全集成了！🎉
