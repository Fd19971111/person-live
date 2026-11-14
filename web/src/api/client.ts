export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const BASE_URL = '/api'

// access token 只保存在内存中，刷新页面后通过 refresh token 重新获取。
let accessToken: string | null = null
let refreshing: Promise<string | null> | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export async function postJson<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(BASE_URL + path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null
  return payload ?? { code: response.status, message: '网络异常，请稍后重试', data: null as T }
}

/** 用 HttpOnly Cookie 中的 refresh token 换新的 access token。 */
export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = postJson<{ accessToken: string }>('/auth/refresh')
      .then((payload) => {
        if (payload.code !== 0) {
          accessToken = null
          return null
        }
        accessToken = payload.data.accessToken
        return accessToken
      })
      .catch(() => null)
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}

/** 表单上传入口：由浏览器自动带 multipart 边界，其余规则同 request。 */
export async function upload<T>(path: string, form: FormData, retry = true): Promise<T> {
  const headers = new Headers()
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(BASE_URL + path, {
    method: 'POST',
    body: form,
    headers,
    credentials: 'include',
  })

  if (response.status === 401 && retry) {
    const token = await refreshAccessToken()
    if (token) {
      return upload<T>(path, form, false)
    }
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null
  if (!payload) {
    throw new ApiError(response.status, '网络异常，请稍后重试')
  }
  if (payload.code !== 0) {
    throw new ApiError(payload.code, payload.message)
  }
  return payload.data
}

/** 统一请求入口：自动带上 access token，401 时尝试刷新一次并重放。 */
export async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(BASE_URL + path, { ...options, headers, credentials: 'include' })

  if (response.status === 401 && retry) {
    const token = await refreshAccessToken()
    if (token) {
      return request<T>(path, options, false)
    }
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null
  if (!payload) {
    throw new ApiError(response.status, '网络异常，请稍后重试')
  }
  if (payload.code !== 0) {
    throw new ApiError(payload.code, payload.message)
  }
  return payload.data
}

/** 从 Content-Disposition 里取出后端建议的文件名。 */
function pickFileName(header: string | null): string | null {
  if (!header) return null
  const matched = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(header)
  const raw = matched?.[1] ?? matched?.[2]
  return raw ? decodeURIComponent(raw.trim()) : null
}

/** 下载二进制响应（数据导出、附件等），带鉴权并在 401 时刷新重试一次。 */
export async function download(path: string, fallbackName: string, retry = true): Promise<void> {
  const headers = new Headers()
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(BASE_URL + path, { headers, credentials: 'include' })

  if (response.status === 401 && retry) {
    const token = await refreshAccessToken()
    if (token) return download(path, fallbackName, false)
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null
    throw new ApiError(response.status, payload?.message || '下载失败，请稍后重试')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = pickFileName(response.headers.get('Content-Disposition')) ?? fallbackName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
