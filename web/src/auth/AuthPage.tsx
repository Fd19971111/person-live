import { useState, type FormEvent } from 'react'

import { useAuth } from './AuthContext'

type Mode = 'login' | 'register'

export function AuthSplash() {
  return (
    <div className="auth-loading">
      <span className="auth-logo">LM</span>
      <p>正在恢复你的空间…</p>
    </div>
  )
}

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('admin')
  const [password, setPassword] = useState('123456')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isLogin = mode === 'login'

  const switchMode = () => {
    setMode(isLogin ? 'register' : 'login')
    setError('')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      if (isLogin) {
        await login(email.trim(), password)
      } else {
        await register(email.trim(), password, nickname.trim())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <aside className="auth-brand">
        <div className="auth-wordmark">
          <span className="auth-logo">LM</span>
          <div>
            <b>生活集</b>
            <small>PERSONAL SPACE</small>
          </div>
        </div>
        <div className="auth-brand-main">
          <div className="eyebrow">A QUIET PLACE FOR EVERYDAY LIFE</div>
          <h1>
            把生活的碎片，
            <br />
            收进同一个地方。
          </h1>
          <p className="lead">
            记账、计划、学习与收藏，都在同一个空间里安静地生长。不需要复杂设置，登录后就能继续。
          </p>
          <div className="auth-points">
            {[
              ['01', '一处记录', '收支、时间与阅读，按自己的节奏整理。'],
              ['02', '一屏总览', '今天的重点，打开就能看到。'],
              ['03', '一直保留', '数据保存在你自己的账号里，随时回来。'],
            ].map(([index, title, desc]) => (
              <div className="auth-point" key={index}>
                <span>{index}</span>
                <div>
                  <b>{title}</b>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-quote">EST. 2026 · 生活集</div>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          <div className="eyebrow">{isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}</div>
          <h2>{isLogin ? '登录你的空间' : '创建你的空间'}</h2>
          <p className="auth-sub">
            {isLogin ? '用注册时的邮箱继续。' : '只需要邮箱和密码，稍后可以随时修改。'}
          </p>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-field">
                <label htmlFor="nickname">昵称</label>
                <input
                  id="nickname"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="怎么称呼你（可留空）"
                  maxLength={32}
                  autoComplete="nickname"
                />
              </div>
            )}
            <div className="auth-field">
              <label htmlFor="email">邮箱</label>
              <input
                id="email"
                type={isLogin ? 'text' : 'email'}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={isLogin ? '邮箱或账号' : 'you@example.com'}
                autoComplete="username"
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">密码</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isLogin ? '输入密码' : '至少 8 位字符'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                minLength={isLogin ? undefined : 8}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? '请稍候…' : isLogin ? '登录' : '创建账号'}
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? '还没有账号？' : '已经有账号？'}
            <button type="button" onClick={switchMode}>
              {isLogin ? '立即注册' : '去登录'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
