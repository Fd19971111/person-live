import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import * as authApi from '../api/auth'
import type { UserInfo } from '../api/auth'

interface AuthContextValue {
  user: UserInfo | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, nickname?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    authApi.restoreSession().then((restored) => {
      if (cancelled) return
      setUser(restored)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: async (email, password) => {
          const result = await authApi.login(email, password)
          setUser(result.user)
        },
        register: async (email, password, nickname) => {
          const result = await authApi.register(email, password, nickname)
          setUser(result.user)
        },
        logout: async () => {
          try {
            await authApi.logout()
          } finally {
            setUser(null)
          }
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内使用')
  }
  return context
}
