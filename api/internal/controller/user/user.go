package user

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/user/v1"
	"study/api/internal/consts"
	authlogic "study/api/internal/logic/auth"
)

// ControllerV1 用户接口。
type ControllerV1 struct{}

// NewV1 创建用户控制器。
func NewV1() *ControllerV1 {
	return &ControllerV1{}
}

// Profile 返回当前登录用户信息。
func (c *ControllerV1) Profile(ctx context.Context, req *v1.ProfileReq) (res *v1.ProfileRes, err error) {
	userID := g.RequestFromCtx(ctx).GetCtxVar(consts.CtxKeyUserId).Int64()
	user, err := authlogic.UserByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return &v1.ProfileRes{
		User: v1.UserInfo{
			Uid:           user.Uid,
			Email:         user.Email,
			Nickname:      user.Nickname,
			AvatarUrl:     user.AvatarUrl,
			EmailVerified: user.EmailVerifiedAt != nil,
		},
	}, nil
}
