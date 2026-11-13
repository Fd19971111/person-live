package v1

import "github.com/gogf/gf/v2/frame/g"

// AlbumPhotoSaveReq 修改照片所属相册与备注。
type AlbumPhotoSaveReq struct {
	g.Meta   `path:"/album/photo/save" method:"post" tags:"相册" summary:"保存照片信息"`
	Id       int64  `json:"id"`
	Category string `json:"category" dc:"相册名，空表示未分类"`
	Note     string `json:"note"`
}

// AlbumPhotoSaveRes 保存后的照片 ID。
type AlbumPhotoSaveRes struct {
	Id int64 `json:"id"`
}

// AlbumPhotoDeleteReq 删除照片（软删除并移除本地文件）。
type AlbumPhotoDeleteReq struct {
	g.Meta `path:"/album/photo/delete" method:"post" tags:"相册" summary:"删除照片"`
	Id     int64 `json:"id"`
}

// AlbumPhotoDeleteRes 删除结果。
type AlbumPhotoDeleteRes struct{}
