'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function DatabaseCheckPage() {
  const [authUsers, setAuthUsers] = useState<any[]>([])
  const [userProfiles, setUserProfiles] = useState<any[]>([])
  const [socialAuth, setSocialAuth] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    setLoading(true)
    setError('')

    try {
      // 检查当前登录用户
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // 查询 user_profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError
      setUserProfiles(profiles || [])

      // 查询 social_authorizations
      const { data: social, error: socialError } = await supabase
        .from('social_authorizations')
        .select('*')
        .order('created_at', { ascending: false })

      if (socialError) {
        console.error('Social auth error:', socialError)
      }
      setSocialAuth(social || [])

    } catch (err: any) {
      console.error('Database check error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const manuallyCreateProfile = async () => {
    if (!currentUser) {
      alert('请先登录！')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name || 'User',
        })
        .select()

      if (error) throw error

      alert('✅ 用户资料创建成功！')
      checkDatabase()
    } catch (err: any) {
      alert('❌ 创建失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !userProfiles.length) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading database information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">数据库状态检查</h1>
          <button
            onClick={checkDatabase}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            🔄 刷新
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            ❌ 错误: {error}
          </div>
        )}

        {/* 当前用户信息 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm mr-3">
              当前用户
            </span>
          </h2>
          {currentUser ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">ID:</span>
                  <p className="font-mono text-sm">{currentUser.id}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Email:</span>
                  <p className="font-medium">{currentUser.email}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Created:</span>
                  <p className="text-sm">{new Date(currentUser.created_at).toLocaleString('zh-CN')}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Email Confirmed:</span>
                  <p className={currentUser.email_confirmed_at ? 'text-green-600' : 'text-orange-600'}>
                    {currentUser.email_confirmed_at ? '✅ 已验证' : '⏳ 未验证'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">未登录</p>
          )}
        </div>

        {/* User Profiles 表 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm mr-3">
                user_profiles ({userProfiles.length})
              </span>
            </h2>
            {currentUser && userProfiles.length === 0 && (
              <button
                onClick={manuallyCreateProfile}
                disabled={loading}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 text-sm"
              >
                ➕ 手动创建我的资料
              </button>
            )}
          </div>

          {userProfiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userProfiles.map((profile) => (
                    <tr key={profile.id} className={currentUser?.id === profile.id ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-3 text-sm">{profile.email}</td>
                      <td className="px-4 py-3 text-sm">{profile.full_name || '-'}</td>
                      <td className="px-4 py-3 text-sm">{new Date(profile.created_at).toLocaleString('zh-CN')}</td>
                      <td className="px-4 py-3 text-sm">
                        {currentUser?.id === profile.id && (
                          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">当前用户</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-yellow-50 rounded-lg">
              <p className="text-yellow-700 mb-2">⚠️ user_profiles 表为空</p>
              <p className="text-sm text-gray-600">这意味着触发器可能没有正常工作</p>
              {currentUser && (
                <button
                  onClick={manuallyCreateProfile}
                  className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  立即创建我的资料
                </button>
              )}
            </div>
          )}
        </div>

        {/* Social Authorizations 表 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm mr-3">
              social_authorizations ({socialAuth.length})
            </span>
          </h2>

          {socialAuth.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {socialAuth.map((auth) => (
                    <tr key={auth.id}>
                      <td className="px-4 py-3 text-sm font-medium">{auth.platform}</td>
                      <td className="px-4 py-3 text-sm">{auth.account_name}</td>
                      <td className="px-4 py-3 text-sm">{new Date(auth.created_at).toLocaleString('zh-CN')}</td>
                      <td className="px-4 py-3 text-sm">
                        {auth.token_expires_at && new Date(auth.token_expires_at) < new Date() ? (
                          <span className="text-red-600">⚠️ 已过期</span>
                        ) : (
                          <span className="text-green-600">✅ 有效</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">暂无社交媒体授权</p>
            </div>
          )}
        </div>

        {/* 诊断信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🔍 诊断信息</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">当前是否登录</span>
              <span className={currentUser ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {currentUser ? '✅ 已登录' : '❌ 未登录'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">user_profiles 记录数</span>
              <span className={userProfiles.length > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {userProfiles.length > 0 ? `✅ ${userProfiles.length} 条` : '❌ 0 条'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">当前用户资料是否存在</span>
              <span className={userProfiles.some(p => p.id === currentUser?.id) ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {currentUser ? (
                  userProfiles.some(p => p.id === currentUser.id) ? '✅ 存在' : '❌ 缺失'
                ) : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-700">社交媒体授权数</span>
              <span className="text-blue-600 font-medium">
                {socialAuth.length} 个
              </span>
            </div>
          </div>

          {currentUser && !userProfiles.some(p => p.id === currentUser.id) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium mb-2">⚠️ 问题检测到</p>
              <p className="text-sm text-yellow-700 mb-3">
                您已登录但 user_profiles 表中没有您的资料。这通常意味着触发器没有正常工作。
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-yellow-800">建议操作：</p>
                <ol className="list-decimal list-inside space-y-1 text-yellow-700">
                  <li>在 Supabase SQL Editor 中执行 fix_user_profiles.sql</li>
                  <li>或点击上方"手动创建我的资料"按钮临时修复</li>
                  <li>刷新此页面查看结果</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
