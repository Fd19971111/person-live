package inspiration

import (
	"context"

	v1 "study/api/api/inspiration/v1"
	inspirationlogic "study/api/internal/logic/inspiration"
)

// Overview 灵感总览。
func (c *ControllerV1) Overview(ctx context.Context, req *v1.InspirationOverviewReq) (res *v1.InspirationOverviewRes, err error) {
	overview, err := inspirationlogic.GetOverview(ctx, currentUserID(ctx))
	if err != nil {
		return nil, err
	}
	return &v1.InspirationOverviewRes{
		Total:       overview.Total,
		MonthAdded:  overview.MonthAdded,
		PinnedCount: overview.PinnedCount,
		TagTotal:    overview.TagTotal,
		Tags:        toTags(overview.Tags),
		Items:       toItems(overview.Items),
	}, nil
}
