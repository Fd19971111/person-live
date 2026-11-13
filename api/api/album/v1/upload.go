package v1

import "github.com/gogf/gf/v2/frame/g"

// AlbumUploadReq 上传一张照片，使用 multipart/form-data。
// 文件字段名为 file，同时可带 category 与 note 文本字段。
type AlbumUploadReq struct {
	g.Meta `path:"/album/photo/upload" method:"post" mime:"multipart/form-data" tags:"相册" summary:"上传照片"`
}

// AlbumUploadRes 上传后的照片 ID。
type AlbumUploadRes struct {
	Id int64 `json:"id"`
}
