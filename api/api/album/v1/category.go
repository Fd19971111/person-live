package v1

import "github.com/gogf/gf/v2/frame/g"

// AlbumCategorySaveReq 新建或修改相册分类，Id 为 0 表示新建。
type AlbumCategorySaveReq struct {
	g.Meta `path:"/album/category/save" method:"post" tags:"相册" summary:"保存相册分类"`
	Id     int64  `json:"id"`
	Name   string `json:"name"`
	Color  string `json:"color"`
}

// AlbumCategorySaveRes 保存后的分类 ID。
type AlbumCategorySaveRes struct {
	Id int64 `json:"id"`
}

// AlbumCategoryDeleteReq 删除相册分类，照片会回到未分类。
type AlbumCategoryDeleteReq struct {
	g.Meta `path:"/album/category/delete" method:"post" tags:"相册" summary:"删除相册分类"`
	Id     int64 `json:"id"`
}

// AlbumCategoryDeleteRes 删除结果。
type AlbumCategoryDeleteRes struct{}
