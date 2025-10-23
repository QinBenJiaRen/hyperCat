import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 使用 @supabase/ssr 的浏览器客户端，自动处理 cookies
// 这样 middleware 就能读取到 session
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)