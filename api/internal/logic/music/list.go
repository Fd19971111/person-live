package music

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// List 返回全部音乐记录，最近添加的排在最前。
func List(ctx context.Context, userID int64) ([]Item, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT id, title, artist, album, playlist, rating, note, color,
		       DATE_FORMAT(DATE_ADD(created_at, INTERVAL 8 HOUR), '%Y-%m-%d') AS day
		FROM music_track
		WHERE user_id = ? AND deleted_at IS NULL
		ORDER BY created_at DESC, id DESC
		LIMIT ?`, userID, maxListSize)
	if err != nil {
		return nil, err
	}
	items := make([]Item, 0, len(rows))
	for _, row := range rows {
		item := Item{
			ID:       row["id"].Int64(),
			Title:    row["title"].String(),
			Artist:   row["artist"].String(),
			Album:    row["album"].String(),
			Playlist: row["playlist"].String(),
			Rating:   row["rating"].Int(),
			Note:     row["note"].String(),
			Color:    row["color"].String(),
		}
		if day, err := parseDay(row["day"].String()); err == nil {
			item.Date = timestampText(day)
		}
		items = append(items, item)
	}
	return items, nil
}
