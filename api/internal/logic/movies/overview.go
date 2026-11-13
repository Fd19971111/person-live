package movies

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// GetOverview 汇总片单总数、各状态数量与平均评分。
func GetOverview(ctx context.Context, userID int64) (*Overview, error) {
	overview := &Overview{}

	rows, err := g.DB().GetAll(ctx, `
		SELECT status, COUNT(*) AS total
		FROM movie_item
		WHERE user_id = ? AND deleted_at IS NULL
		GROUP BY status`, userID)
	if err != nil {
		return nil, err
	}
	counts := make(map[int]int, len(rows))
	total := 0
	for _, row := range rows {
		status := row["status"].Int()
		count := row["total"].Int()
		counts[status] = count
		total += count
	}
	overview.Total = total
	overview.WantCount = counts[StatusWant]
	overview.WatchingCount = counts[StatusWatching]
	overview.WatchedCount = counts[StatusWatched]
	overview.Statuses = []StatusCount{
		{Status: StatusWant, Name: StatusName(StatusWant), Count: overview.WantCount},
		{Status: StatusWatching, Name: StatusName(StatusWatching), Count: overview.WatchingCount},
		{Status: StatusWatched, Name: StatusName(StatusWatched), Count: overview.WatchedCount},
	}

	value, err := g.DB().GetValue(ctx, `
		SELECT COALESCE(AVG(rating), 0) FROM movie_item
		WHERE user_id = ? AND deleted_at IS NULL AND rating > 0`, userID)
	if err != nil {
		return nil, err
	}
	overview.AvgRating = round1(value.Float64())

	if overview.Items, err = List(ctx, userID); err != nil {
		return nil, err
	}
	return overview, nil
}
