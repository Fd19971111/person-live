package v1

import "github.com/gogf/gf/v2/frame/g"

// MusicTrackSaveReq 新增或编辑音乐记录，Id 为 0 时表示新增。
type MusicTrackSaveReq struct {
	g.Meta   `path:"/music/track/save" method:"post" tags:"音乐" summary:"保存音乐记录"`
	Id       int64  `json:"id"`
	Title    string `json:"title"`
	Artist   string `json:"artist"`
	Album    string `json:"album"`
	Playlist string `json:"playlist" dc:"所属歌单或收听场景"`
	Rating   int    `json:"rating" dc:"1-5 星，0 表示未评分"`
	Note     string `json:"note"`
	Color    string `json:"color"`
}

type MusicTrackSaveRes struct {
	Id int64 `json:"id"`
}

// MusicTrackDeleteReq 删除音乐记录（软删除）。
type MusicTrackDeleteReq struct {
	g.Meta `path:"/music/track/delete" method:"post" tags:"音乐" summary:"删除音乐记录"`
	Id     int64 `json:"id"`
}

type MusicTrackDeleteRes struct{}
