package music

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/music/v1"
	"study/api/internal/consts"
	musiclogic "study/api/internal/logic/music"
)

type ControllerV1 struct{}

func NewV1() *ControllerV1 {
	return &ControllerV1{}
}

func currentUserID(ctx context.Context) int64 {
	return g.RequestFromCtx(ctx).GetCtxVar(consts.CtxKeyUserId).Int64()
}

func toItem(item musiclogic.Item) v1.MusicTrackItem {
	return v1.MusicTrackItem{
		Id:       item.ID,
		Title:    item.Title,
		Artist:   item.Artist,
		Album:    item.Album,
		Playlist: item.Playlist,
		Rating:   item.Rating,
		Note:     item.Note,
		Color:    item.Color,
		Date:     item.Date,
	}
}

func toItems(items []musiclogic.Item) []v1.MusicTrackItem {
	result := make([]v1.MusicTrackItem, 0, len(items))
	for _, item := range items {
		result = append(result, toItem(item))
	}
	return result
}

func toPlaylists(playlists []musiclogic.PlaylistCount) []v1.MusicPlaylistCount {
	result := make([]v1.MusicPlaylistCount, 0, len(playlists))
	for _, playlist := range playlists {
		result = append(result, v1.MusicPlaylistCount{Name: playlist.Name, Count: playlist.Count})
	}
	return result
}
