-- =====================================================
-- 修复触发器和补充缺失的用户资料
-- =====================================================
-- 在 Supabase SQL Editor 中执行此脚本
-- =====================================================

-- 步骤 1: 删除现有触发器和函数（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 步骤 2: 重新创建函数（改进版本，增加错误处理）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.user_profiles.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 步骤 3: 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 步骤 4: 为现有用户补充资料（修复历史数据）
INSERT INTO public.user_profiles (id, email, full_name, avatar_url, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  au.raw_user_meta_data->>'avatar_url',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;  -- 只插入不存在的记录

-- 步骤 5: 验证修复结果
SELECT 
  'auth.users' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as count
FROM public.user_profiles;

-- 步骤 6: 显示详细对比
SELECT 
  au.id,
  au.email as auth_email,
  up.email as profile_email,
  up.full_name,
  au.created_at as user_created,
  up.created_at as profile_created,
  CASE 
    WHEN up.id IS NULL THEN '❌ Missing Profile'
    ELSE '✅ Profile Exists'
  END as status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC
LIMIT 10;

-- =====================================================
-- 完成！
-- =====================================================
-- 预期结果:
-- 1. 触发器已重新创建
-- 2. 现有用户已补充资料
-- 3. 两个表的记录数应该相等
-- =====================================================
