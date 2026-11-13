package movies

import (
	"context"

	v1 "study/api/api/movies/v1"
	movieslogic "study/api/internal/logic/movies"
)

// Overview 电影清单总览。
func (c *ControllerV1) Overview(ctx context.Context, req *v1.MoviesOverviewReq) (res *v1.MoviesOverviewRes, err error) {
	overview, err := movieslogic.GetOverview(ctx, currentUserID(ctx))
	if err != nil {
		return nil, err
	}
	return &v1.MoviesOverviewRes{
		Total:         overview.Total,
		WantCount:     overview.WantCount,
		WatchingCount: overview.WatchingCount,
		WatchedCount:  overview.WatchedCount,
		AvgRating:     overview.AvgRating,
		Statuses:      toStatuses(overview.Statuses),
		Items:         toItems(overview.Items),
	}, nil
}
