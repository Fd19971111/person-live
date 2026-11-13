package study

import (
	"context"

	v1 "study/api/api/study/v1"
	studylogic "study/api/internal/logic/study"
)

// Overview 学习总览。
func (c *ControllerV1) Overview(ctx context.Context, req *v1.StudyOverviewReq) (res *v1.StudyOverviewRes, err error) {
	overview, err := studylogic.GetOverview(ctx, currentUserID(ctx))
	if err != nil {
		return nil, err
	}
	return &v1.StudyOverviewRes{
		Month:              overview.Month,
		MonthMinutes:       overview.MonthMinutes,
		MonthTargetMinutes: overview.MonthTargetMinutes,
		MonthRate:          overview.MonthRate,
		ChangeMinutes:      overview.ChangeMinutes,
		StreakDays:         overview.StreakDays,
		WeekMinutes:        overview.WeekMinutes,
		WeekGoalMinutes:    overview.WeekGoalMinutes,
		WeekRate:           overview.WeekRate,
		WeekDays:           toDayStats(overview.WeekDays),
		Heatmap:            toDayStats(overview.Heatmap),
		Courses:            toCourseItems(overview.Courses),
		Notes:              toNoteItems(overview.Notes),
	}, nil
}
