package consts

const (
	// CtxKeyUserId 鉴权中间件写入的用户主键。
	CtxKeyUserId = "ctxUserId"
	// CtxKeyUserUid 鉴权中间件写入的用户对外标识。
	CtxKeyUserUid = "ctxUserUid"

	// RefreshCookieName 存放 refresh token 的 Cookie 名。
	RefreshCookieName = "study_refresh_token"
	// RefreshCookiePath 限制 Cookie 只发送给认证接口。
	RefreshCookiePath = "/api/auth"

	// TokenPurposeVerifyEmail 邮箱验证令牌。
	TokenPurposeVerifyEmail = 1
	// TokenPurposeResetPassword 重置密码令牌。
	TokenPurposeResetPassword = 2
)
