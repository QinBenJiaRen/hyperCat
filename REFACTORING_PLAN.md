# HyperCat 项目重构计划

## 🎯 重构目标

将 Next.js 前端项目与后端 API 分离，创建独立的 Node.js 后端服务。

### 架构变更
- **当前**：Next.js 全栈应用（前端 + API Routes）
- **目标**：Next.js 前端 + Node.js/Express 后端

### 服务部署
- **hyperCat（前端）**：保持当前端口，调用后端 API
- **hyperCatServer（后端）**：
  - 本地：`http://localhost:3001`
  - 生产：`https://api.hypecat.com`

---

## 📋 迁移清单

### 1. 后端服务搭建 (hyperCatServer)

#### 1.1 项目初始化
```bash
cd /Users/haifeng/Project/hyperCatServer
npm init -y
```

#### 1.2 安装依赖
```bash
# 核心依赖
npm install express cors dotenv cookie-parser express-session

# Supabase
npm install @supabase/supabase-js

# Stripe
npm install stripe

# 工具库
npm install axios

# TypeScript 相关
npm install -D typescript @types/node @types/express @types/cors @types/cookie-parser @types/express-session ts-node nodemon

# 开发工具
npm install -D eslint prettier
```

#### 1.3 目录结构
```
hyperCatServer/
├── src/
│   ├── config/
│   │   ├── supabase.ts          # Supabase 配置
│   │   ├── stripe.ts            # Stripe 配置
│   │   └── environment.ts       # 环境变量管理
│   ├── routes/
│   │   ├── auth.routes.ts       # 认证路由
│   │   ├── social-auth.routes.ts # 社交授权路由
│   │   ├── social-publish.routes.ts # 社交发布路由
│   │   └── stripe.routes.ts     # 支付路由
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── social-auth.controller.ts
│   │   ├── social-publish.controller.ts
│   │   └── stripe.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts   # 认证中间件
│   │   ├── cors.middleware.ts   # CORS 配置
│   │   └── error.middleware.ts  # 错误处理
│   ├── utils/
│   │   ├── session.ts           # Session 管理
│   │   └── response.ts          # 统一响应格式
│   ├── types/
│   │   └── index.ts             # TypeScript 类型定义
│   └── server.ts                # 主服务器文件
├── database/
│   ├── supabase_setup.sql       # 数据库初始化脚本
│   └── add_subscription_fields.sql
├── .env.example
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

### 2. API 迁移详情

#### 2.1 认证 API (Auth)

**源文件**：
- `hyperCat/src/contexts/AuthContext.tsx`
- `hyperCat/src/app/auth/callback/page.tsx`

**迁移到**：`hyperCatServer/src/routes/auth.routes.ts`

**API 端点**：
| 方法 | 路径 | 功能 | 原实现位置 |
|------|------|------|------------|
| POST | /api/auth/signup | 用户注册 | `AuthContext.signUp()` |
| POST | /api/auth/login | 用户登录 | `AuthContext.signIn()` |
| POST | /api/auth/logout | 用户登出 | `AuthContext.signOut()` |
| GET | /api/auth/session | 获取当前会话 | `supabase.auth.getSession()` |
| POST | /api/auth/oauth | OAuth 登录 | `AuthContext.signInWithOAuth()` |
| GET | /api/auth/callback | OAuth 回调 | `/auth/callback/page.tsx` |
| POST | /api/auth/reset-password | 重置密码 | `AuthContext.resetPassword()` |

**请求/响应格式**：
```typescript
// POST /api/auth/signup
Request: { email: string, password: string }
Response: { user: User, session: Session }

// POST /api/auth/login
Request: { email: string, password: string }
Response: { user: User, session: Session }

// GET /api/auth/session
Response: { user: User | null, session: Session | null }
```

---

#### 2.2 社交授权 API (Social Auth)

**源文件**：
- `hyperCat/src/app/api/social-auth/status/route.ts`
- `hyperCat/src/app/api/social-auth/callback/[platform]/route.ts`
- `hyperCat/src/app/api/social-auth/revoke/route.ts`
- `hyperCat/src/app/api/social-auth/authorize/route.ts` (如果存在)

**迁移到**：`hyperCatServer/src/routes/social-auth.routes.ts`

**API 端点**：
| 方法 | 路径 | 功能 | 数据库表 |
|------|------|------|----------|
| GET | /api/social-auth/status?platform=x | 检查授权状态 | `social_authorizations` |
| GET | /api/social-auth/callback/:platform | OAuth 回调处理 | `social_authorizations` |
| POST | /api/social-auth/revoke?platform=x | 撤销授权 | `social_authorizations` |
| POST | /api/social-auth/authorize | 发起授权 | - |

---

#### 2.3 社交发布 API (Social Publish)

**源文件**：
- `hyperCat/src/app/api/social-publish/route.ts`

**迁移到**：`hyperCatServer/src/routes/social-publish.routes.ts`

**API 端点**：
| 方法 | 路径 | 功能 | 外部 API |
|------|------|------|----------|
| POST | /api/social-publish | 发布内容到社交平台 | Instagram/Facebook/X API |

**请求格式**：
```typescript
Request: {
  platform: 'instagram' | 'facebook' | 'x',
  content: string,
  accountId?: string
}
```

---

#### 2.4 支付 API (Stripe)

**源文件**：
- `hyperCat/src/app/api/stripe/checkout/route.ts`
- `hyperCat/src/app/api/stripe/webhook/route.ts`

**迁移到**：`hyperCatServer/src/routes/stripe.routes.ts`

**API 端点**：
| 方法 | 路径 | 功能 | 数据库表 |
|------|------|------|----------|
| POST | /api/stripe/checkout | 创建支付会话 | `user_profiles` |
| POST | /api/stripe/webhook | Stripe Webhook 回调 | `user_profiles` |
| GET | /api/stripe/subscription-info | 获取订阅信息 (新增) | `user_profiles` |

**新增端点详情**：
```typescript
// GET /api/stripe/subscription-info
Response: {
  subscription_plan: 'free' | 'plus' | 'pro',
  subscription_status: 'active' | 'inactive' | 'canceled',
  stripe_customer_id: string | null,
  stripe_subscription_id: string | null,
  subscription_current_period_end: string | null
}
```

---

### 3. 环境变量配置

#### 3.1 hyperCatServer/.env.local
```bash
# 服务器配置
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase 配置
SUPABASE_URL=https://aawmqxkxdpjhaxpxpgnu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe 配置
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Session 配置
SESSION_SECRET=your-super-secret-key-change-in-production

# API 密钥 (如果需要)
OPENAI_API_KEY=sk-proj-...
DEEPSEEK_API_KEY=sk-...
```

#### 3.2 hyperCat/.env.local (更新后)
```bash
# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:3001
# 生产环境使用: https://api.hypecat.com

# Supabase (仅保留公共配置，用于前端展示)
NEXT_PUBLIC_SUPABASE_URL=https://aawmqxkxdpjhaxpxpgnu.supabase.co

# Stripe 公钥
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# AI 配置 (保留在前端，用于 /api/generate)
OPENAI_API_KEY=sk-proj-...
DEEPSEEK_API_KEY=sk-...
```

---

### 4. 前端修改清单

#### 4.1 创建 API 客户端
**文件**：`hyperCat/src/lib/apiClient.ts`

```typescript
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 允许发送 cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，跳转登录
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

#### 4.2 修改 AuthContext
**文件**：`hyperCat/src/contexts/AuthContext.tsx`

**修改点**：
1. 删除 `import { supabase } from '../lib/supabase'`
2. 使用 `apiClient` 替代所有 `supabase.auth` 调用
3. Session 管理改为从后端 API 获取

#### 4.3 修改组件
| 文件 | 修改内容 |
|------|----------|
| `src/app/login/page.tsx` | 使用 `AuthContext` 的新方法 |
| `src/app/signup/page.tsx` | 使用 `AuthContext` 的新方法 |
| `src/app/content-creation/page.tsx` | 社交授权调用改为 `apiClient` |
| `src/app/publishing/page.tsx` | 发布内容调用改为 `apiClient` |
| `src/app/membership/page.tsx` | 支付流程调用改为 `apiClient` |
| `src/app/database-check/page.tsx` | 删除或改为调用后端 API |
| `src/app/debug-auth/page.tsx` | 删除或改为调用后端 API |

#### 4.4 删除文件
```bash
# 删除 API Routes (保留 /api/generate)
rm -rf hyperCat/src/app/api/social-auth
rm -rf hyperCat/src/app/api/social-publish
rm -rf hyperCat/src/app/api/stripe

# 删除 Supabase 客户端配置
rm hyperCat/src/lib/supabase.ts

# 删除数据库调试页面 (可选)
rm hyperCat/src/app/database-check/page.tsx
rm hyperCat/src/app/debug-auth/page.tsx
```

#### 4.5 更新 Middleware
**文件**：`hyperCat/src/middleware.ts`

**修改点**：
- 删除 Supabase session 检查
- 改为调用后端 `/api/auth/session` 验证登录状态
- 或者简化为仅做路由保护，session 验证由后端处理

---

### 5. Session 管理方案

#### 5.1 后端实现 (hyperCatServer)
```typescript
// 使用 express-session + Supabase JWT
import session from 'express-session'

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    sameSite: 'lax',
  },
}))

// 登录时保存 session
req.session.user = {
  id: user.id,
  email: user.email,
  accessToken: session.access_token,
  refreshToken: session.refresh_token,
}
```

#### 5.2 前端配置
```typescript
// axios 自动发送 cookies
apiClient.defaults.withCredentials = true
```

---

### 6. CORS 配置

**文件**：`hyperCatServer/src/middleware/cors.middleware.ts`

```typescript
import cors from 'cors'

const allowedOrigins = [
  'http://localhost:3000',
  'https://hypecat.com',
  'https://www.hypecat.com',
]

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, // 允许 cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

---

### 7. 数据库迁移

#### 7.1 复制 SQL 脚本
```bash
cp hyperCat/supabase_setup.sql hyperCatServer/database/
cp hyperCat/add_subscription_fields.sql hyperCatServer/database/
cp hyperCat/update_user_profile_trigger.sql hyperCatServer/database/
cp hyperCat/fix_user_profiles.sql hyperCatServer/database/
```

#### 7.2 数据库表
- `auth.users` - Supabase 内置用户表
- `public.user_profiles` - 用户资料
- `public.social_authorizations` - 社交媒体授权
- `public.publishing_history` - 发布历史

---

### 8. 测试流程

#### 8.1 后端测试
```bash
cd /Users/haifeng/Project/hyperCatServer
npm install
npm run dev
```

访问：`http://localhost:3001/api/health`（需要添加健康检查端点）

#### 8.2 前端测试
```bash
cd /Users/haifeng/Project/hyperCat
npm run dev
```

#### 8.3 功能测试清单
- [ ] 注册新用户
- [ ] 登录
- [ ] 获取当前 session
- [ ] 登出
- [ ] 连接 Instagram 账号
- [ ] 连接 Facebook 账号
- [ ] 连接 X 账号
- [ ] 发布内容到社交媒体
- [ ] 查看发布历史
- [ ] 选择 Plus 套餐
- [ ] Stripe Checkout 支付
- [ ] Webhook 回调更新订阅状态
- [ ] 查看订阅信息

---

### 9. 部署配置

#### 9.1 生产环境变量
```bash
# hyperCatServer (生产)
FRONTEND_URL=https://hypecat.com
NODE_ENV=production

# hyperCat (生产)
NEXT_PUBLIC_API_URL=https://api.hypecat.com
```

#### 9.2 Nginx 配置 (示例)
```nginx
# api.hypecat.com
server {
    listen 80;
    server_name api.hypecat.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### 10. 迁移步骤总结

1. ✅ **创建 hyperCatServer 项目结构**
2. ✅ **安装依赖**
3. ✅ **配置环境变量**
4. ✅ **迁移 Supabase 配置**
5. ✅ **迁移认证 API**
6. ✅ **迁移社交授权 API**
7. ✅ **迁移社交发布 API**
8. ✅ **迁移 Stripe API**
9. ✅ **添加新的订阅信息 API**
10. ✅ **配置 CORS 和 Session**
11. ✅ **前端创建 API 客户端**
12. ✅ **前端修改 AuthContext**
13. ✅ **前端修改所有组件**
14. ✅ **前端删除旧代码**
15. ✅ **测试所有功能**
16. ✅ **部署到生产环境**

---

## ⚠️ 注意事项

1. **Session 安全**：
   - 使用 httpOnly cookies 防止 XSS
   - HTTPS 环境下启用 secure 标志
   - 设置合理的 cookie domain

2. **API 安全**：
   - 所有敏感操作需要验证登录状态
   - 使用 Supabase RLS 保护数据库
   - Webhook 签名验证 (Stripe)

3. **错误处理**：
   - 后端统一错误响应格式
   - 前端全局错误拦截器
   - 友好的用户提示

4. **性能优化**：
   - API 响应缓存
   - 数据库连接池
   - 压缩响应数据

5. **向后兼容**：
   - 保留 `/api/generate` 路由在前端
   - 逐步迁移，确保每个功能测试通过

---

## 📞 需要确认的问题

1. **AI 生成内容 API** (`/api/generate`) 是否也迁移到后端？
   - 建议：保留在前端，因为直接调用 OpenAI/DeepSeek

2. **数据库调试页面** 是否保留？
   - 建议：删除或改为后端管理面板

3. **OAuth 回调** 是否需要特殊处理？
   - 当前：Next.js 页面渲染
   - 迁移后：后端处理后重定向

4. **Stripe Webhook URL** 需要更新：
   - 从：`https://hypecat.com/api/stripe/webhook`
   - 到：`https://api.hypecat.com/api/stripe/webhook`

---

## 🚀 开始执行

确认以上计划后，我们可以开始逐步执行。建议顺序：

1. 先搭建后端框架（1-3 天）
2. 逐个 API 迁移并测试（3-5 天）
3. 前端适配（2-3 天）
4. 集成测试（1-2 天）
5. 部署上线（1 天）

**总预计时间**：1-2 周

是否开始执行第一步？
