package music

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// GetOverview 汇总曲目总数、歌单与演唱者数量、平均评分。
func GetOverview(ctx context.Context, userID int64) (*Overview, error) {
	overview := &Overview{}

	total, err := countSQL(ctx, `
		SELECT COUNT(*) FROM music_track
		WHERE user_id = ? AND deleted_at IS NULL`, userID)
	if err != nil {
		return nil, err
	}
	overview.Total = total

	playlistCount, err := countSQL(ctx, `
		SELECT COUNT(DISTINCT playlist) FROM music_track
		WHERE user_id = ? AND deleted_at IS NULL AND playlist <> ''`, userID)
	if err != nil {
		return nil, err
	}
	overview.PlaylistCount = playlistCount

	artistCount, err := countSQL(ctx, `
		SELECT COUNT(DISTINCT artist) FROM music_track
		WHERE user_id = ? AND deleted_at IS NULL AND artist <> ''`, userID)
	if err != nil {
		return nil, err
	}
	overview.ArtistCount = artistCount

	value, err := g.DB().GetValue(ctx, `
		SELECT COALESCE(AVG(rating), 0) FROM music_track
		WHERE user_id = ? AND deleted_at IS NULL AND rating > 0`, userID)
	if err != nil {
		return nil, err
	}
	overview.AvgRating = round1(value.Float64())

	rows, err := g.DB().GetAll(ctx, `
		SELECT playlist AS name, COUNT(*) AS total
		FROM music_track
		WHERE user_id = ? AND deleted_at IS NULL AND playlist <> ''
		GROUP BY playlist
		ORDER BY total DESC, playlist ASC
		LIMIT ?`, userID, maxPlaylistRows)
	if err != nil {
		return nil, err
	}
	overview.Playlists = make([]PlaylistCount, 0, len(rows))
	for _, row := range rows {
		overview.Playlists = append(overview.Playlists, PlaylistCount{
			Name:  row["name"].String(),
			Count: row["total"].Int(),
		})
	}

	if overview.Items, err = List(ctx, userID); err != nil {
		return nil, err
	}
	return overview, nil
}
