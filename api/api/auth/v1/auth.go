package v1

import (
	"github.com/gogf/gf/v2/frame/g"

	userv1 "study/api/api/user/v1"
)

// RegisterReq 邮箱注册。
type RegisterReq struct {
	g.Meta   `path:"/auth/register" method:"post" tags:"认证" summary:"邮箱注册"`
	Email    string `json:"email"    v:"required|email#请输入邮箱|邮箱格式不正确"`
	Password string `json:"password" v:"required|length:8,64#请输入密码|密码长度需为 8-64 位"`
	Nickname string `json:"nickname" v:"max-length:32#昵称不能超过 32 个字符"`
}

// RegisterRes 注册成功后直接返回登录态。
type RegisterRes struct {
	AccessToken string         `json:"accessToken" dc:"访问令牌"`
	ExpiresIn   int64          `json:"expiresIn"   dc:"访问令牌有效期（秒）"`
	User        userv1.UserInfo `json:"user"        dc:"用户信息"`
}

// LoginReq 邮箱密码登录。
type LoginReq struct {
	g.Meta   `path:"/auth/login" method:"post" tags:"认证" summary:"邮箱密码登录"`
	Email    string `json:"email"    v:"required#请输入邮箱"`
	Password string `json:"password" v:"required#请输入密码"`
}

// LoginRes 登录结果。
type LoginRes struct {
	AccessToken string          `json:"accessToken" dc:"访问令牌"`
	ExpiresIn   int64           `json:"expiresIn"   dc:"访问令牌有效期（秒）"`
	User        userv1.UserInfo `json:"user"        dc:"用户信息"`
}

// RefreshReq 使用 HttpOnly Cookie 中的 refresh token 换取新令牌。
type RefreshReq struct {
	g.Meta `path:"/auth/refresh" method:"post" tags:"认证" summary:"刷新访问令牌"`
}

// RefreshRes 刷新结果。
type RefreshRes struct {
	AccessToken string          `json:"accessToken" dc:"访问令牌"`
	ExpiresIn   int64           `json:"expiresIn"   dc:"访问令牌有效期（秒）"`
	User        userv1.UserInfo `json:"user"        dc:"用户信息"`
}

// LogoutReq 退出登录。
type LogoutReq struct {
	g.Meta `path:"/auth/logout" method:"post" tags:"认证" summary:"退出登录"`
}

// LogoutRes 退出结果。
type LogoutRes struct{}

// VerifyEmailReq 消费邮箱验证令牌。
type VerifyEmailReq struct {
	g.Meta `path:"/auth/verify-email" method:"post" tags:"认证" summary:"验证邮箱"`
	Token  string `json:"token" v:"required#缺少验证令牌"`
}

// VerifyEmailRes 验证结果。
type VerifyEmailRes struct{}
