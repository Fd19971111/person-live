package travel

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// List 返回全部足迹，按出发日期倒序。
func List(ctx context.Context, userID int64) ([]Item, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT id, title, region, days, rating, note, color,
		       DATE_FORMAT(visited_on, '%Y-%m-%d') AS day
		FROM travel_trip
		WHERE user_id = ? AND deleted_at IS NULL
		ORDER BY visited_on DESC, id DESC
		LIMIT ?`, userID, maxListSize)
	if err != nil {
		return nil, err
	}
	items := make([]Item, 0, len(rows))
	for _, row := range rows {
		item := Item{
			ID:        row["id"].Int64(),
			Title:     row["title"].String(),
			Region:    row["region"].String(),
			VisitedOn: row["day"].String(),
			Days:      row["days"].Int(),
			Rating:    row["rating"].Int(),
			Note:      row["note"].String(),
			Color:     row["color"].String(),
		}
		if day, err := parseDay(item.VisitedOn); err == nil {
			item.Date = timestampText(day)
			item.Year = day.Year()
		}
		items = append(items, item)
	}
	return items, nil
}
