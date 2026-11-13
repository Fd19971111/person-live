package fitness

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// List 返回最近的运动记录，最新的排在最前。
func List(ctx context.Context, userID int64) ([]Item, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT id, activity, minutes, distance_km, calories, note, color,
		       DATE_FORMAT(performed_on, '%Y-%m-%d') AS day
		FROM fitness_record
		WHERE user_id = ? AND deleted_at IS NULL
		ORDER BY performed_on DESC, id DESC
		LIMIT ?`, userID, maxListSize)
	if err != nil {
		return nil, err
	}
	items := make([]Item, 0, len(rows))
	for _, row := range rows {
		item := Item{
			ID:          row["id"].Int64(),
			Activity:    row["activity"].String(),
			Minutes:     row["minutes"].Int(),
			DistanceKm:  row["distance_km"].Float64(),
			Calories:    row["calories"].Int(),
			PerformedOn: row["day"].String(),
			Note:        row["note"].String(),
			Color:       row["color"].String(),
		}
		if day, err := parseDay(item.PerformedOn); err == nil {
			item.Date = timestampText(day)
			item.Weekday = weekdayLabel(day)
		}
		items = append(items, item)
	}
	return items, nil
}
