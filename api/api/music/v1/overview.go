package v1

import "github.com/gogf/gf/v2/frame/g"

// MusicTrackItem 一条音乐记录。
type MusicTrackItem struct {
	Id       int64  `json:"id"`
	Title    string `json:"title"`
	Artist   string `json:"artist"`
	Album    string `json:"album"`
	Playlist string `json:"playlist"`
	Rating   int    `json:"rating"`
	Note     string `json:"note"`
	Color    string `json:"color"`
	Date     string `json:"date"`
}

// MusicPlaylistCount 歌单及其曲目数量。
type MusicPlaylistCount struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

// MusicOverviewReq 音乐记录总览。
type MusicOverviewReq struct {
	g.Meta `path:"/music/overview" method:"get" tags:"音乐" summary:"音乐记录总览"`
}

// MusicOverviewRes 音乐页所需的全部数据。
type MusicOverviewRes struct {
	Total         int                  `json:"total"`
	PlaylistCount int                  `json:"playlistCount"`
	ArtistCount   int                  `json:"artistCount"`
	AvgRating     float64              `json:"avgRating"`
	Playlists     []MusicPlaylistCount `json:"playlists"`
	Items         []MusicTrackItem     `json:"items"`
}
