# 🔧 修复用户资料缺失问题

## 问题诊断

✅ **问题已确认**：
- `auth.users` 表有用户记录
- `public.user_profiles` 表缺少对应记录
- 触发器未正常工作

## 🚀 解决步骤

### 步骤 1: 在 Supabase 执行修复脚本

1. 登录 Supabase 控制台: https://supabase.com
2. 选择您的项目
3. 点击左侧菜单 **SQL Editor**
4. 点击 **+ New query**
5. 复制 `fix_user_profiles.sql` 的全部内容
6. 粘贴到 SQL Editor
7. 点击右下角 **RUN** 按钮

### 步骤 2: 验证修复结果

执行完成后，您应该看到三组结果：

#### 结果 1: 记录数对比
```
table_name      | count
----------------|------
auth.users      | 1
user_profiles   | 1
```
两个表的数量应该相等 ✅

#### 结果 2: 详细对比
```
id         | auth_email           | profile_email        | full_name  | status
-----------|----------------------|---------------------|------------|------------------
33cc6343.. | jiahaifengjv@gmail.. | jiahaifengjv@gmail..| Test User  | ✅ Profile Exists
```

### 步骤 3: 测试新用户注册

修复后，测试注册新用户：

1. 访问: http://localhost:3000/signup
2. 注册一个新账号
3. 在 Supabase SQL Editor 执行：

```sql
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.created_at
FROM public.user_profiles up
ORDER BY up.created_at DESC
LIMIT 5;
```

应该能看到新用户的资料 ✅

## 🔍 如果仍然有问题

### 检查触发器状态

```sql
-- 查看触发器
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

应该返回：
```
trigger_name          | event_object_table | action_statement
----------------------|--------------------|------------------
on_auth_user_created | users              | EXECUTE FUNCTION public.handle_new_user()
```

### 检查函数

```sql
-- 查看函数
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';
```

应该返回：
```
routine_name     | routine_type
-----------------|-------------
handle_new_user | FUNCTION
```

### 手动测试触发器

```sql
-- 手动调用函数测试
SELECT public.handle_new_user();
```

## 📊 查看当前数据

### 查看所有用户资料

```sql
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.created_at,
  up.updated_at
FROM public.user_profiles up
ORDER BY up.created_at DESC;
```

### 查看用户授权

```sql
SELECT 
  sa.platform,
  sa.account_name,
  sa.created_at,
  up.email
FROM public.social_authorizations sa
JOIN public.user_profiles up ON sa.user_id = up.id
ORDER BY sa.created_at DESC;
```

### 查看发布历史

```sql
SELECT 
  ph.platform,
  ph.status,
  ph.created_at,
  up.email
FROM public.publishing_history ph
JOIN public.user_profiles up ON ph.user_id = up.id
ORDER BY ph.created_at DESC
LIMIT 10;
```

## ✅ 验证清单

完成修复后，请验证：

- [ ] `fix_user_profiles.sql` 已在 Supabase 执行
- [ ] `auth.users` 和 `user_profiles` 记录数相同
- [ ] 触发器 `on_auth_user_created` 存在
- [ ] 函数 `handle_new_user` 存在
- [ ] 注册新用户后，`user_profiles` 自动创建记录
- [ ] 可以正常登录

## 🎯 预期结果

修复后：
1. ✅ 现有用户资料已补充
2. ✅ 新注册用户会自动创建资料
3. ✅ 登录功能正常工作
4. ✅ 社交媒体授权正常保存

## 💡 为什么会出现这个问题？

可能的原因：
1. **初次执行 SQL 时触发器创建失败** - 权限或语法问题
2. **用户在触发器创建前就注册了** - 历史数据缺失
3. **触发器被意外删除** - 数据库操作失误

修复脚本解决了所有这些问题：
- ✅ 重新创建触发器（改进版）
- ✅ 补充历史用户数据
- ✅ 增加错误处理
- ✅ 添加 ON CONFLICT 处理重复记录

## 🆘 需要帮助？

如果执行后仍有问题，请提供：
1. SQL 执行的输出结果
2. 任何错误信息
3. `auth.users` 和 `user_profiles` 的记录数

我会进一步帮您诊断！
