package fitness

import (
	"context"

	v1 "study/api/api/fitness/v1"
	fitnesslogic "study/api/internal/logic/fitness"
)

// Overview 运动记录总览。
func (c *ControllerV1) Overview(ctx context.Context, req *v1.FitnessOverviewReq) (res *v1.FitnessOverviewRes, err error) {
	overview, err := fitnesslogic.GetOverview(ctx, currentUserID(ctx))
	if err != nil {
		return nil, err
	}
	return &v1.FitnessOverviewRes{
		Total:        overview.Total,
		TotalMinutes: overview.TotalMinutes,
		WeekMinutes:  overview.WeekMinutes,
		MonthMinutes: overview.MonthMinutes,
		StreakDays:   overview.StreakDays,
		Heatmap:      toDayStats(overview.Heatmap),
		Items:        toItems(overview.Items),
	}, nil
}
