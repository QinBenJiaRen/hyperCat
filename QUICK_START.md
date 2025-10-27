# 快速开始 - Stripe 集成

## 🚀 立即开始（3 步完成）

### 1️⃣ 安装依赖
```bash
npm install @stripe/stripe-js stripe
```

### 2️⃣ 配置环境变量

在 `.env.local` 添加（从 Stripe Dashboard 获取）：
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3️⃣ 运行数据库迁移

在 Supabase SQL Editor 中运行 `add_subscription_fields.sql`

## 🧪 测试

使用测试卡: `4242 4242 4242 4242`
- 过期日期: 12/34
- CVC: 123

## 📚 完整文档

查看 `STRIPE_SETUP.md` 了解详细步骤

## ✅ 已实现功能

- ✅ 移除 Full Name 字段
- ✅ 优化页面高度适配一屏
- ✅ Stripe Checkout 集成
- ✅ Webhook 事件处理
- ✅ 订阅状态管理
- ✅ 支付成功/取消处理
- ✅ 加载状态动画

现在只需安装依赖和配置密钥即可开始使用！🎉
