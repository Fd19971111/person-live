package album

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"strings"
	"time"

	"github.com/gogf/gf/v2/errors/gcode"
	"github.com/gogf/gf/v2/errors/gerror"
	"github.com/gogf/gf/v2/frame/g"
)

// ShareTTL 分享链接的默认有效期，过期后需重新生成。
const ShareTTL = 7 * 24 * time.Hour

// ShareClaim 分享令牌里的声明：谁、哪个相册、何时失效。
type ShareClaim struct {
	UserID   int64  `json:"u"`
	Category string `json:"c"`
	ExpireAt int64  `json:"e"`
}

// ErrShareInvalid 令牌被篡改、过期或格式不正确时的统一错误。
var ErrShareInvalid = gerror.NewCode(gcode.CodeInvalidParameter, "分享链接已失效，请让分享人重新生成")

// CreateShare 生成只读分享令牌。令牌靠签名自证，服务端无需建表存储。
func CreateShare(ctx context.Context, userID int64, category string) (string, time.Time, error) {
	claim := ShareClaim{
		UserID:   userID,
		Category: strings.TrimSpace(category),
		ExpireAt: time.Now().Add(ShareTTL).Unix(),
	}
	raw, err := json.Marshal(claim)
	if err != nil {
		return "", time.Time{}, err
	}
	payload := base64.RawURLEncoding.EncodeToString(raw)
	return payload + "." + signature(ctx, payload), time.Unix(claim.ExpireAt, 0), nil
}

// ParseShare 校验签名并检查有效期。
func ParseShare(ctx context.Context, token string) (ShareClaim, error) {
	claim := ShareClaim{}
	payload, sig, found := strings.Cut(strings.TrimSpace(token), ".")
	if !found || payload == "" || sig == "" {
		return claim, ErrShareInvalid
	}
	if !hmac.Equal([]byte(sig), []byte(signature(ctx, payload))) {
		return claim, ErrShareInvalid
	}

	raw, err := base64.RawURLEncoding.DecodeString(payload)
	if err != nil {
		return claim, ErrShareInvalid
	}
	if err = json.Unmarshal(raw, &claim); err != nil {
		return claim, ErrShareInvalid
	}
	if claim.UserID <= 0 || time.Now().Unix() > claim.ExpireAt {
		return claim, ErrShareInvalid
	}
	return claim, nil
}

// signature 用 jwt.secret 派生分享专用密钥，避免与登录令牌互相冒用。
func signature(ctx context.Context, payload string) string {
	secret := g.Cfg().MustGet(ctx, "jwt.secret").String()
	mac := hmac.New(sha256.New, []byte("album-share:"+secret))
	mac.Write([]byte(payload))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

// SharedOverview 分享页可读的数据。指定相册时只给该相册的照片与分类，
// 避免把用户其他相册的名字与数量一并暴露出去。
func SharedOverview(ctx context.Context, claim ShareClaim) (Overview, error) {
	overview, err := GetOverview(ctx, claim.UserID)
	if err != nil {
		return Overview{}, err
	}
	if claim.Category == "" {
		return overview, nil
	}

	photos := make([]Photo, 0, len(overview.Photos))
	var size int64
	for _, photo := range overview.Photos {
		if photo.Category != claim.Category {
			continue
		}
		photos = append(photos, photo)
		size += photo.SizeBytes
	}

	categories := make([]Category, 0, 1)
	for _, item := range overview.Categories {
		if item.Name == claim.Category {
			categories = append(categories, item)
		}
	}

	overview.Photos = photos
	overview.Categories = categories
	overview.Total = len(photos)
	overview.SizeBytes = size
	return overview, nil
}
