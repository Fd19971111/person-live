package inspiration

import (
	"context"
	"time"

	"github.com/gogf/gf/v2/frame/g"
)

// GetOverview 汇总灵感总数、本月新增、置顶数量与标签分布。
func GetOverview(ctx context.Context, userID int64) (*Overview, error) {
	overview := &Overview{}
	month := time.Now().In(cst).Format("2006-01")

	total, err := countSQL(ctx, `
		SELECT COUNT(*) FROM inspiration_item
		WHERE user_id = ? AND deleted_at IS NULL`, userID)
	if err != nil {
		return nil, err
	}
	overview.Total = total

	monthAdded, err := countSQL(ctx, `
		SELECT COUNT(*) FROM inspiration_item
		WHERE user_id = ? AND deleted_at IS NULL
			AND DATE_FORMAT(DATE_ADD(created_at, INTERVAL 8 HOUR), '%Y-%m') = ?`, userID, month)
	if err != nil {
		return nil, err
	}
	overview.MonthAdded = monthAdded

	pinned, err := countSQL(ctx, `
		SELECT COUNT(*) FROM inspiration_item
		WHERE user_id = ? AND deleted_at IS NULL AND pinned = 1`, userID)
	if err != nil {
		return nil, err
	}
	overview.PinnedCount = pinned

	tagTotal, err := countSQL(ctx, `
		SELECT COUNT(DISTINCT tag) FROM inspiration_item
		WHERE user_id = ? AND deleted_at IS NULL AND tag <> ''`, userID)
	if err != nil {
		return nil, err
	}
	overview.TagTotal = tagTotal

	rows, err := g.DB().GetAll(ctx, `
		SELECT tag AS name, COUNT(*) AS total
		FROM inspiration_item
		WHERE user_id = ? AND deleted_at IS NULL AND tag <> ''
		GROUP BY tag
		ORDER BY total DESC, tag ASC
		LIMIT ?`, userID, maxTagRows)
	if err != nil {
		return nil, err
	}
	overview.Tags = make([]TagCount, 0, len(rows))
	for _, row := range rows {
		overview.Tags = append(overview.Tags, TagCount{
			Name:  row["name"].String(),
			Count: row["total"].Int(),
		})
	}

	if overview.Items, err = List(ctx, userID); err != nil {
		return nil, err
	}
	return overview, nil
}
