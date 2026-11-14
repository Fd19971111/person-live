package v1

import "github.com/gogf/gf/v2/frame/g"

// AlbumShareReq 为相册生成只读分享链接。
type AlbumShareReq struct {
	g.Meta   `path:"/album/share" method:"post" tags:"相册" summary:"生成相册分享链接"`
	Category string `json:"category" dc:"相册名，留空表示整个相册"`
}

// AlbumShareRes 分享令牌由前端拼成完整地址。
type AlbumShareRes struct {
	Token     string `json:"token"`
	ExpiresAt string `json:"expiresAt"`
}

// AlbumShareViewReq 公开访问：凭令牌读取只读相册。
type AlbumShareViewReq struct {
	g.Meta `path:"/album/view" method:"get" tags:"相册" summary:"查看分享的相册"`
	Token  string `json:"t" dc:"分享令牌"`
}

// AlbumShareViewRes 分享页所需的全部数据。
type AlbumShareViewRes struct {
	Owner    string           `json:"owner"`
	Category string           `json:"category"`
	ExpireAt string           `json:"expireAt"`
	Total    int              `json:"total"`
	SizeText string           `json:"sizeText"`
	Photos   []AlbumPhotoItem `json:"photos"`
}
