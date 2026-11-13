package middleware

import (
	"strings"

	"github.com/gogf/gf/v2/net/ghttp"

	"study/api/internal/consts"
	authlogic "study/api/internal/logic/auth"
)

// Auth 校验 Bearer access token，并把用户标识写入上下文。
func Auth(r *ghttp.Request) {
	header := r.Header.Get("Authorization")
	if !strings.HasPrefix(header, "Bearer ") {
		unauthorized(r)
		return
	}

	claims, err := authlogic.ParseAccessToken(r.Context(), strings.TrimSpace(strings.TrimPrefix(header, "Bearer ")))
	if err != nil {
		unauthorized(r)
		return
	}

	r.SetCtxVar(consts.CtxKeyUserId, claims.UserID)
	r.SetCtxVar(consts.CtxKeyUserUid, claims.Uid)
	r.Middleware.Next()
}

func unauthorized(r *ghttp.Request) {
	r.Response.Status = 401
	r.SetError(authlogic.ErrUnauthorized)
}
