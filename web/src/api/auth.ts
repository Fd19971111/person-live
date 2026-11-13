import { postJson, request, setAccessToken } from './client'

export interface UserInfo {
  uid: string
  email: string
  nickname: string
  avatarUrl: string
  emailVerified: boolean
}

export interface AuthResult {
  accessToken: string
  expiresIn: number
  user: UserInfo
}

export async function register(email: string, password: string, nickname?: string): Promise<AuthResult> {
  const payload = await postJson<AuthResult>('/auth/register', { email, password, nickname })
  if (payload.code !== 0) {
    throw new Error(payload.message)
  }
  setAccessToken(payload.data.accessToken)
  return payload.data
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const payload = await postJson<AuthResult>('/auth/login', { email, password })
  if (payload.code !== 0) {
    throw new Error(payload.message)
  }
  setAccessToken(payload.data.accessToken)
  return payload.data
}

export async function logout(): Promise<void> {
  try {
    await request('/auth/logout', { method: 'POST' })
  } finally {
    setAccessToken(null)
  }
}

export function verifyEmail(token: string): Promise<void> {
  return request('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

export function getProfile(): Promise<{ user: UserInfo }> {
  return request('/user/profile')
}

/** 应用启动时尝试用 refresh token 恢复登录态，失败则返回 null。 */
let restoring: Promise<UserInfo | null> | null = null
export function restoreSession(): Promise<UserInfo | null> {
  if (!restoring) {
    restoring = postJson<AuthResult>('/auth/refresh')
      .then((payload) => {
        if (payload.code !== 0) {
          setAccessToken(null)
          return null
        }
        setAccessToken(payload.data.accessToken)
        return payload.data.user
      })
      .catch(() => null)
      .finally(() => {
        restoring = null
      })
  }
  return restoring
}
