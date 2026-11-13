package music

import (
	"context"

	v1 "study/api/api/music/v1"
	musiclogic "study/api/internal/logic/music"
)

// Overview 音乐记录总览。
func (c *ControllerV1) Overview(ctx context.Context, req *v1.MusicOverviewReq) (res *v1.MusicOverviewRes, err error) {
	overview, err := musiclogic.GetOverview(ctx, currentUserID(ctx))
	if err != nil {
		return nil, err
	}
	return &v1.MusicOverviewRes{
		Total:         overview.Total,
		PlaylistCount: overview.PlaylistCount,
		ArtistCount:   overview.ArtistCount,
		AvgRating:     overview.AvgRating,
		Playlists:     toPlaylists(overview.Playlists),
		Items:         toItems(overview.Items),
	}, nil
}
