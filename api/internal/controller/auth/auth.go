package auth

import (
	"context"
	"net/http"
	"time"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"

	v1 "study/api/api/auth/v1"
	userv1 "study/api/api/user/v1"
	"study/api/internal/consts"
	authlogic "study/api/internal/logic/auth"
)

// ControllerV1 认证接口。
type ControllerV1 struct{}

// NewV1 创建认证控制器。
func NewV1() *ControllerV1 {
	return &ControllerV1{}
}

// Register 注册并签发登录态。
func (c *ControllerV1) Register(ctx context.Context, req *v1.RegisterReq) (res *v1.RegisterRes, err error) {
	user, tokens, err := authlogic.Register(ctx, req.Email, req.Password, req.Nickname)
	if err != nil {
		return nil, err
	}
	r := g.RequestFromCtx(ctx)
	setRefreshCookie(ctx, r, tokens)
	return &v1.RegisterRes{
		AccessToken: tokens.AccessToken,
		ExpiresIn:   tokens.ExpiresIn,
		User:        toUserInfo(user),
	}, nil
}

// Login 登录并签发登录态。
func (c *ControllerV1) Login(ctx context.Context, req *v1.LoginReq) (res *v1.LoginRes, err error) {
	r := g.RequestFromCtx(ctx)
	user, tokens, err := authlogic.Login(ctx, req.Email, req.Password, r.GetClientIp(), r.UserAgent())
	if err != nil {
		return nil, err
	}
	setRefreshCookie(ctx, r, tokens)
	return &v1.LoginRes{
		AccessToken: tokens.AccessToken,
		ExpiresIn:   tokens.ExpiresIn,
		User:        toUserInfo(user),
	}, nil
}

// Refresh 轮换 refresh token。
func (c *ControllerV1) Refresh(ctx context.Context, req *v1.RefreshReq) (res *v1.RefreshRes, err error) {
	r := g.RequestFromCtx(ctx)
	raw := r.Cookie.Get(consts.RefreshCookieName).String()
	user, tokens, err := authlogic.Refresh(ctx, raw, r.GetClientIp(), r.UserAgent())
	if err != nil {
		clearRefreshCookie(r)
		return nil, err
	}
	setRefreshCookie(ctx, r, tokens)
	return &v1.RefreshRes{
		AccessToken: tokens.AccessToken,
		ExpiresIn:   tokens.ExpiresIn,
		User:        toUserInfo(user),
	}, nil
}

// Logout 退出登录并清除 Cookie。
func (c *ControllerV1) Logout(ctx context.Context, req *v1.LogoutReq) (res *v1.LogoutRes, err error) {
	r := g.RequestFromCtx(ctx)
	if err = authlogic.Logout(ctx, r.Cookie.Get(consts.RefreshCookieName).String()); err != nil {
		return nil, err
	}
	clearRefreshCookie(r)
	return &v1.LogoutRes{}, nil
}

// VerifyEmail 验证邮箱。
func (c *ControllerV1) VerifyEmail(ctx context.Context, req *v1.VerifyEmailReq) (res *v1.VerifyEmailRes, err error) {
	if err = authlogic.VerifyEmail(ctx, req.Token); err != nil {
		return nil, err
	}
	return &v1.VerifyEmailRes{}, nil
}

func setRefreshCookie(ctx context.Context, r *ghttp.Request, tokens *authlogic.Tokens) {
	r.Cookie.SetHttpCookie(&http.Cookie{
		Name:     consts.RefreshCookieName,
		Value:    tokens.RefreshToken,
		Path:     consts.RefreshCookiePath,
		HttpOnly: true,
		Secure:   g.Cfg().MustGet(ctx, "auth.cookieSecure", false).Bool(),
		SameSite: http.SameSiteLaxMode,
		Expires:  tokens.RefreshExpiresAt,
		MaxAge:   int(time.Until(tokens.RefreshExpiresAt).Seconds()),
	})
}

func clearRefreshCookie(r *ghttp.Request) {
	r.Cookie.SetHttpCookie(&http.Cookie{
		Name:     consts.RefreshCookieName,
		Value:    "",
		Path:     consts.RefreshCookiePath,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
	})
}

func toUserInfo(user *authlogic.User) userv1.UserInfo {
	return userv1.UserInfo{
		Uid:           user.Uid,
		Email:         user.Email,
		Nickname:      user.Nickname,
		AvatarUrl:     user.AvatarUrl,
		EmailVerified: user.EmailVerifiedAt != nil,
	}
}
