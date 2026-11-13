package inspiration

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// List 返回全部灵感，置顶优先，其余按收藏时间倒序。
func List(ctx context.Context, userID int64) ([]Item, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT id, title, content, tag, source, color, pinned,
		       DATE_FORMAT(DATE_ADD(created_at, INTERVAL 8 HOUR), '%Y-%m-%d') AS day
		FROM inspiration_item
		WHERE user_id = ? AND deleted_at IS NULL
		ORDER BY pinned DESC, created_at DESC, id DESC
		LIMIT ?`, userID, maxListSize)
	if err != nil {
		return nil, err
	}
	items := make([]Item, 0, len(rows))
	for _, row := range rows {
		item := Item{
			ID:      row["id"].Int64(),
			Title:   row["title"].String(),
			Content: row["content"].String(),
			Tag:     row["tag"].String(),
			Source:  row["source"].String(),
			Color:   row["color"].String(),
			Pinned:  row["pinned"].Int() == 1,
		}
		if day, err := parseDay(row["day"].String()); err == nil {
			item.Date = timestampText(day)
		}
		items = append(items, item)
	}
	return items, nil
}
