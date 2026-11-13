package movies

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// List 返回全部电影，最近添加的排在最前。
func List(ctx context.Context, userID int64) ([]Item, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT id, title, year, genre, director, rating, status, note, color,
		       DATE_FORMAT(DATE_ADD(created_at, INTERVAL 8 HOUR), '%Y-%m-%d') AS day
		FROM movie_item
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
			Year:     row["year"].Int(),
			Genre:    row["genre"].String(),
			Director: row["director"].String(),
			Rating:   row["rating"].Float64(),
			Status:   row["status"].Int(),
			Note:     row["note"].String(),
			Color:    row["color"].String(),
		}
		item.StatusName = StatusName(item.Status)
		if day, err := parseDay(row["day"].String()); err == nil {
			item.Date = timestampText(day)
		}
		items = append(items, item)
	}
	return items, nil
}
