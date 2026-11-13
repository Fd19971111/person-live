package v1

import "github.com/gogf/gf/v2/frame/g"

// InspirationItemSaveReq 新增或编辑灵感，Id 为 0 时表示新增。
type InspirationItemSaveReq struct {
	g.Meta  `path:"/inspiration/item/save" method:"post" tags:"灵感" summary:"保存灵感"`
	Id      int64  `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
	Tag     string `json:"tag"`
	Source  string `json:"source" dc:"来源，链接或书名"`
	Color   string `json:"color"`
	Pinned  bool   `json:"pinned"`
}

type InspirationItemSaveRes struct {
	Id int64 `json:"id"`
}

// InspirationItemDeleteReq 删除灵感（软删除）。
type InspirationItemDeleteReq struct {
	g.Meta `path:"/inspiration/item/delete" method:"post" tags:"灵感" summary:"删除灵感"`
	Id     int64 `json:"id"`
}

type InspirationItemDeleteRes struct{}

// InspirationItemPinReq 设置或取消置顶。
type InspirationItemPinReq struct {
	g.Meta `path:"/inspiration/item/pin" method:"post" tags:"灵感" summary:"置顶灵感"`
	Id     int64 `json:"id"`
	Pinned bool  `json:"pinned"`
}

type InspirationItemPinRes struct{}
