# 🚨 需要安装 Stripe 依赖包

## 问题
项目无法找到 Stripe 模块，因为 npm 命令执行失败。

## 解决方案

### 方法 1: 使用 Node 终端安装（推荐）

1. 打开 VS Code 终端
2. 选择 "node" 终端（不是 zsh）
3. 运行以下命令：

```bash
npm install @stripe/stripe-js stripe
```

### 方法 2: 手动设置 PATH 后安装

```bash
# 找到 node 和 npm 的位置
which node
which npm

# 设置 PATH（根据实际路径调整）
export PATH="/usr/local/bin:$PATH"

# 然后安装
npm install @stripe/stripe-js stripe
```

### 方法 3: 使用 package.json

1. 打开 `package.json`
2. 在 `dependencies` 部分手动添加：

```json
"@stripe/stripe-js": "^2.4.0",
"stripe": "^14.11.0"
```

3. 然后运行：

```bash
npm install
```

## 安装后

安装成功后，需要取消注释以下文件中的代码：

1. **src/lib/stripe.ts** - Stripe 客户端配置
2. **src/app/api/stripe/checkout/route.ts** - 创建支付会话
3. **src/app/api/stripe/webhook/route.ts** - Webhook 处理

每个文件中都有 `TODO` 注释标记需要取消注释的代码。

## 当前状态

✅ 项目可以运行（Stripe 功能被临时禁用）
⚠️ Stripe 支付功能暂时不可用
⚠️ 点击 "Pay with Stripe" 会显示错误提示

## 验证安装

安装成功后，运行：

```bash
npm list stripe
npm list @stripe/stripe-js
```

应该看到版本信息，表示安装成功。
