package v1

import "github.com/gogf/gf/v2/frame/g"

// MovieItemSaveReq 新增或编辑电影，Id 为 0 时表示新增。
type MovieItemSaveReq struct {
	g.Meta   `path:"/movies/item/save" method:"post" tags:"电影" summary:"保存电影"`
	Id       int64   `json:"id"`
	Title    string  `json:"title"`
	Year     int     `json:"year"`
	Genre    string  `json:"genre"`
	Director string  `json:"director"`
	Rating   float64 `json:"rating"`
	Status   int     `json:"status" dc:"1 想看 / 2 在看 / 3 已看完"`
	Note     string  `json:"note"`
	Color    string  `json:"color"`
}

type MovieItemSaveRes struct {
	Id int64 `json:"id"`
}

// MovieItemDeleteReq 删除电影（软删除）。
type MovieItemDeleteReq struct {
	g.Meta `path:"/movies/item/delete" method:"post" tags:"电影" summary:"删除电影"`
	Id     int64 `json:"id"`
}

type MovieItemDeleteRes struct{}

// MovieItemStatusReq 切换观看状态。
type MovieItemStatusReq struct {
	g.Meta `path:"/movies/item/status" method:"post" tags:"电影" summary:"切换观看状态"`
	Id     int64 `json:"id"`
	Status int   `json:"status"`
}

type MovieItemStatusRes struct{}
