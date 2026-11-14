package album

import (
	"context"
	"time"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/album/v1"
	albumlogic "study/api/internal/logic/album"
)

// Share 为当前用户的相册生成只读分享令牌，链接有效期见 albumlogic.ShareTTL。
func (c *ControllerV1) Share(ctx context.Context, req *v1.AlbumShareReq) (res *v1.AlbumShareRes, err error) {
	token, expireAt, err := albumlogic.CreateShare(ctx, currentUserID(ctx), req.Category)
	if err != nil {
		return nil, err
	}
	return &v1.AlbumShareRes{
		Token:     token,
		ExpiresAt: expireAt.Format("2006-01-02 15:04"),
	}, nil
}

// PublicControllerV1 免登录的只读接口，只暴露凭令牌可访问的数据。
type PublicControllerV1 struct{}

// NewPublicV1 创建公开控制器。
func NewPublicV1() *PublicControllerV1 {
	return &PublicControllerV1{}
}

// View 凭分享令牌读取相册，令牌无效时返回参数错误而不是 401，避免误导前端跳登录。
func (c *PublicControllerV1) View(ctx context.Context, req *v1.AlbumShareViewReq) (res *v1.AlbumShareViewRes, err error) {
	claim, err := albumlogic.ParseShare(ctx, req.Token)
	if err != nil {
		return nil, err
	}
	overview, err := albumlogic.SharedOverview(ctx, claim)
	if err != nil {
		return nil, err
	}
	return &v1.AlbumShareViewRes{
		Owner:    ownerName(ctx, claim.UserID),
		Category: claim.Category,
		ExpireAt: time.Unix(claim.ExpireAt, 0).Format("2006-01-02 15:04"),
		Total:    overview.Total,
		SizeText: albumlogic.SizeText(overview.SizeBytes),
		Photos:   toPhotos(overview.Photos),
	}, nil
}

// ownerName 分享页只展示昵称，不暴露邮箱等账号信息。
func ownerName(ctx context.Context, userID int64) string {
	value, err := g.DB().GetValue(ctx, `SELECT nickname FROM user WHERE id = ?`, userID)
	if err != nil || value.IsNil() {
		return ""
	}
	return value.String()
}
