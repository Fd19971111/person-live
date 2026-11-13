package v1

import "github.com/gogf/gf/v2/frame/g"

// AlbumCategoryItem 一个相册分类。
type AlbumCategoryItem struct {
	Id    int64  `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
	Count int    `json:"count"`
}

// AlbumPhotoItem 一张照片。
type AlbumPhotoItem struct {
	Id        int64  `json:"id"`
	Url       string `json:"url"`
	Category  string `json:"category"`
	Name      string `json:"name"`
	Note      string `json:"note"`
	SizeBytes int64  `json:"sizeBytes"`
	SizeText  string `json:"sizeText"`
	Date      string `json:"date"`
}

// AlbumOverviewReq 相册总览。
type AlbumOverviewReq struct {
	g.Meta `path:"/album/overview" method:"get" tags:"相册" summary:"相册总览"`
}

// AlbumOverviewRes 相册页所需的全部数据。
type AlbumOverviewRes struct {
	Total      int                 `json:"total"`
	SizeBytes  int64               `json:"sizeBytes"`
	SizeText   string              `json:"sizeText"`
	Categories []AlbumCategoryItem `json:"categories"`
	Photos     []AlbumPhotoItem    `json:"photos"`
}
