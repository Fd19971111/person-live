package travel

import (
	"context"

	v1 "study/api/api/travel/v1"
	travellogic "study/api/internal/logic/travel"
)

// Overview 旅行足迹总览。
func (c *ControllerV1) Overview(ctx context.Context, req *v1.TravelOverviewReq) (res *v1.TravelOverviewRes, err error) {
	overview, err := travellogic.GetOverview(ctx, currentUserID(ctx))
	if err != nil {
		return nil, err
	}
	return &v1.TravelOverviewRes{
		Total:      overview.Total,
		PlaceCount: overview.PlaceCount,
		TotalDays:  overview.TotalDays,
		YearCount:  overview.YearCount,
		Year:       overview.Year,
		AvgRating:  overview.AvgRating,
		Items:      toItems(overview.Items),
	}, nil
}
