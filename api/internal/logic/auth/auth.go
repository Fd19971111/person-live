package auth

import (
	"context"
	"strings"
	"time"

	"github.com/gogf/gf/v2/database/gdb"
	"github.com/gogf/gf/v2/errors/gcode"
	"github.com/gogf/gf/v2/errors/gerror"
	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/gtime"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"study/api/internal/consts"
	"study/api/internal/utility"
)

// 业务错误。
var (
	ErrEmailExists       = gerror.NewCode(gcode.New(1001, "该邮箱已注册", nil))
	ErrInvalidCredential = gerror.NewCode(gcode.New(1002, "邮箱或密码不正确", nil))
	ErrAccountDisabled   = gerror.NewCode(gcode.New(1003, "账号已被禁用", nil))
	ErrTokenInvalid      = gerror.NewCode(gcode.New(1004, "链接无效或已过期", nil))
	ErrUnauthorized      = gerror.NewCode(gcode.New(gcode.CodeNotAuthorized.Code(), "登录已失效，请重新登录", nil))
)

// User 是内部使用的用户视图，不包含密码摘要。
type User struct {
	ID              int64
	Uid             string
	Email           string
	Nickname        string
	AvatarUrl       string
	Timezone        string
	EmailVerifiedAt *gtime.Time
}

// Tokens 是一次签发产生的令牌对。
type Tokens struct {
	AccessToken      string
	ExpiresIn        int64
	RefreshToken     string
	RefreshExpiresAt time.Time
}

// Claims 是 access token 的载荷。
type Claims struct {
	UserID int64  `json:"uid"`
	Uid    string `json:"sub_uid"`
	jwt.RegisteredClaims
}

// Register 创建账号并直接签发登录令牌。
func Register(ctx context.Context, email, password, nickname string) (*User, *Tokens, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	if nickname = strings.TrimSpace(nickname); nickname == "" {
		nickname = defaultNickname(email)
	}

	count, err := g.DB().Model("user").Ctx(ctx).Where("email", email).Count()
	if err != nil {
		return nil, nil, err
	}
	if count > 0 {
		return nil, nil, ErrEmailExists
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return nil, nil, err
	}

	uid := utility.NewULID()
	id, err := g.DB().Model("user").Ctx(ctx).Data(g.Map{
		"uid":           uid,
		"email":         email,
		"password_hash": string(hash),
		"nickname":      nickname,
	}).InsertAndGetId()
	if err != nil {
		return nil, nil, err
	}

	if err = createEmailToken(ctx, id); err != nil {
		return nil, nil, err
	}

	tokens, err := issueTokens(ctx, id, uid, "", "")
	if err != nil {
		return nil, nil, err
	}

	return &User{ID: id, Uid: uid, Email: email, Nickname: nickname}, tokens, nil
}

// Login 校验邮箱密码并签发令牌。
func Login(ctx context.Context, email, password, ip, userAgent string) (*User, *Tokens, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	record, err := g.DB().Model("user").Ctx(ctx).Where("email", email).One()
	if err != nil {
		return nil, nil, err
	}
	if record.IsEmpty() {
		return nil, nil, ErrInvalidCredential
	}

	if record["status"].Int() != 1 {
		return nil, nil, ErrAccountDisabled
	}
	user := scanUser(record)
	if bcrypt.CompareHashAndPassword([]byte(record["password_hash"].String()), []byte(password)) != nil {
		return nil, nil, ErrInvalidCredential
	}

	if _, err = g.DB().Model("user").Ctx(ctx).Where("id", user.ID).Data(g.Map{
		"last_login_at": gtime.Now(),
		"last_login_ip": ip,
	}).Update(); err != nil {
		return nil, nil, err
	}

	tokens, err := issueTokens(ctx, user.ID, user.Uid, ip, userAgent)
	if err != nil {
		return nil, nil, err
	}
	return user, tokens, nil
}

// Refresh 轮换 refresh token，并返回新的令牌对。
func Refresh(ctx context.Context, rawToken, ip, userAgent string) (*User, *Tokens, error) {
	if rawToken == "" {
		return nil, nil, ErrUnauthorized
	}

	record, err := g.DB().Model("user_session").Ctx(ctx).
		Where("token_hash", utility.Sha256Hex(rawToken)).One()
	if err != nil {
		return nil, nil, err
	}
	if record.IsEmpty() {
		return nil, nil, ErrUnauthorized
	}

	sessionID := record["id"].Int64()
	family := record["family_uid"].String()
	expiresAt := record["expires_at"].GTime()

	if !record["revoked_at"].IsNil() {
		// 已作废的令牌被再次使用，视为泄露，吊销整个家族。
		_, _ = g.DB().Model("user_session").Ctx(ctx).
			Where("family_uid", family).WhereNull("revoked_at").
			Data(g.Map{"revoked_at": gtime.Now()}).Update()
		return nil, nil, ErrUnauthorized
	}
	if expiresAt == nil || expiresAt.Before(gtime.Now()) {
		return nil, nil, ErrUnauthorized
	}

	userRecord, err := g.DB().Model("user").Ctx(ctx).
		Where("id", record["user_id"].Int64()).One()
	if err != nil {
		return nil, nil, err
	}
	if userRecord.IsEmpty() {
		return nil, nil, ErrUnauthorized
	}
	user := scanUser(userRecord)

	if _, err = g.DB().Model("user_session").Ctx(ctx).
		Where("id", sessionID).Data(g.Map{"revoked_at": gtime.Now()}).Update(); err != nil {
		return nil, nil, err
	}

	tokens, err := issueTokens(ctx, user.ID, user.Uid, ip, userAgent, family)
	if err != nil {
		return nil, nil, err
	}
	return user, tokens, nil
}

// Logout 吊销传入 refresh token 对应的会话。
func Logout(ctx context.Context, rawToken string) error {
	if rawToken == "" {
		return nil
	}
	_, err := g.DB().Model("user_session").Ctx(ctx).
		Where("token_hash", utility.Sha256Hex(rawToken)).
		WhereNull("revoked_at").
		Data(g.Map{"revoked_at": gtime.Now()}).Update()
	return err
}

// VerifyEmail 消费邮箱验证令牌。
func VerifyEmail(ctx context.Context, rawToken string) error {
	if rawToken == "" {
		return ErrTokenInvalid
	}
	record, err := g.DB().Model("auth_token").Ctx(ctx).
		Where("token_hash", utility.Sha256Hex(rawToken)).
		Where("purpose", consts.TokenPurposeVerifyEmail).
		WhereNull("used_at").
		WhereGT("expires_at", gtime.Now()).One()
	if err != nil {
		return err
	}
	if record.IsEmpty() {
		return ErrTokenInvalid
	}

	now := gtime.Now()
	if _, err = g.DB().Model("auth_token").Ctx(ctx).
		Where("id", record["id"].Int64()).Data(g.Map{"used_at": now}).Update(); err != nil {
		return err
	}
	_, err = g.DB().Model("user").Ctx(ctx).
		Where("id", record["user_id"].Int64()).Data(g.Map{"email_verified_at": now}).Update()
	return err
}

// UserByID 按主键读取用户。
func UserByID(ctx context.Context, id int64) (*User, error) {
	record, err := g.DB().Model("user").Ctx(ctx).Where("id", id).One()
	if err != nil {
		return nil, err
	}
	if record.IsEmpty() {
		return nil, ErrUnauthorized
	}
	return scanUser(record), nil
}

// ParseAccessToken 校验并解析 access token。
func ParseAccessToken(ctx context.Context, rawToken string) (*Claims, error) {
	secret := g.Cfg().MustGet(ctx, "jwt.secret").String()
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(rawToken, claims, func(t *jwt.Token) (any, error) {
		return []byte(secret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
	if err != nil || !token.Valid {
		return nil, ErrUnauthorized
	}
	return claims, nil
}

// issueTokens 生成 access token，并持久化 refresh token 摘要。
func issueTokens(ctx context.Context, userID int64, uid, ip, userAgent string, family ...string) (*Tokens, error) {
	secret := g.Cfg().MustGet(ctx, "jwt.secret").String()
	accessTtl := g.Cfg().MustGet(ctx, "jwt.accessTtl", "15m").Duration()
	refreshTtl := g.Cfg().MustGet(ctx, "jwt.refreshTtl", "720h").Duration()

	now := time.Now()
	claims := Claims{
		UserID: userID,
		Uid:    uid,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   uid,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(accessTtl)),
		},
	}
	signed, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
	if err != nil {
		return nil, err
	}

	familyUid := ""
	if len(family) > 0 {
		familyUid = family[0]
	}
	if familyUid == "" {
		familyUid = utility.NewULID()
	}

	rawToken := utility.NewRandomToken()
	expiresAt := now.Add(refreshTtl)
	if _, err = g.DB().Model("user_session").Ctx(ctx).Data(g.Map{
		"user_id":      userID,
		"token_hash":   utility.Sha256Hex(rawToken),
		"family_uid":   familyUid,
		"ip":           ip,
		"user_agent":   truncate(userAgent, 255),
		"expires_at":   expiresAt,
		"last_used_at": now,
	}).Insert(); err != nil {
		return nil, err
	}

	return &Tokens{
		AccessToken:      signed,
		ExpiresIn:        int64(accessTtl.Seconds()),
		RefreshToken:     rawToken,
		RefreshExpiresAt: expiresAt,
	}, nil
}

// createEmailToken 生成邮箱验证令牌。未接入 SMTP 时，验证链接写入日志。
func createEmailToken(ctx context.Context, userID int64) error {
	rawToken := utility.NewRandomToken()
	expiresAt := gtime.Now().Add(24 * time.Hour)
	if _, err := g.DB().Model("auth_token").Ctx(ctx).Data(g.Map{
		"user_id":    userID,
		"purpose":    consts.TokenPurposeVerifyEmail,
		"token_hash": utility.Sha256Hex(rawToken),
		"expires_at": expiresAt,
	}).Insert(); err != nil {
		return err
	}
	baseUrl := g.Cfg().MustGet(ctx, "auth.webBaseUrl", "http://localhost:5173").String()
	g.Log().Infof(ctx, "邮箱验证链接: %s/verify-email?token=%s", baseUrl, rawToken)
	return nil
}

func scanUser(record gdb.Record) *User {
	return &User{
		ID:              record["id"].Int64(),
		Uid:             record["uid"].String(),
		Email:           record["email"].String(),
		Nickname:        record["nickname"].String(),
		AvatarUrl:       record["avatar_url"].String(),
		Timezone:        record["timezone"].String(),
		EmailVerifiedAt: record["email_verified_at"].GTime(),
	}
}

func defaultNickname(email string) string {
	if index := strings.IndexByte(email, '@'); index > 0 {
		return email[:index]
	}
	return "新用户"
}

func truncate(value string, limit int) string {
	if len(value) <= limit {
		return value
	}
	return value[:limit]
}
