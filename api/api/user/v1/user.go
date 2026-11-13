package v1

import "github.com/gogf/gf/v2/frame/g"

// UserInfo 是对外暴露的用户信息。
type UserInfo struct {
	Uid           string `json:"uid"           dc:"用户唯一标识"`
	Email         string `json:"email"         dc:"邮箱"`
	Nickname      string `json:"nickname"      dc:"昵称"`
	AvatarUrl     string `json:"avatarUrl"     dc:"头像"`
	EmailVerified bool   `json:"emailVerified" dc:"邮箱是否已验证"`
}

// ProfileReq 获取当前登录用户。
type ProfileReq struct {
	g.Meta `path:"/user/profile" method:"get" tags:"用户" summary:"当前登录用户"`
}

// ProfileRes 当前登录用户信息。
type ProfileRes struct {
	User UserInfo `json:"user"`
}
