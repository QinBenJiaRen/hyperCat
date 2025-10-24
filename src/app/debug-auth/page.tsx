'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugAuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSignUp = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Test User',
          },
        },
      })
      setResult({ type: 'signUp', data, error })
    } catch (e) {
      setResult({ type: 'signUp', error: e })
    }
    setLoading(false)
  }

  const testSignIn = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      setResult({ type: 'signIn', data, error })
    } catch (e) {
      setResult({ type: 'signIn', error: e })
    }
    setLoading(false)
  }

  const testGetUser = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.getUser()
      setResult({ type: 'getUser', data, error })
    } catch (e) {
      setResult({ type: 'getUser', error: e })
    }
    setLoading(false)
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('user_profiles').select('count')
      setResult({ type: 'connection', data, error })
    } catch (e) {
      setResult({ type: 'connection', error: e })
    }
    setLoading(false)
  }

  const checkEnv = () => {
    setResult({
      type: 'env',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Auth Debug Tool</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="password123"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={checkEnv}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              Check Environment
            </button>
            <button
              onClick={testConnection}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
            >
              Test DB Connection
            </button>
            <button
              onClick={testSignUp}
              disabled={loading || !email || !password}
              className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 disabled:opacity-50"
            >
              Test Sign Up
            </button>
            <button
              onClick={testSignIn}
              disabled={loading || !email || !password}
              className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              Test Sign In
            </button>
            <button
              onClick={testGetUser}
              className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600"
            >
              Get Current User
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Result: {result.type}
            </h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
