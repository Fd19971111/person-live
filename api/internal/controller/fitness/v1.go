package fitness

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/fitness/v1"
	"study/api/internal/consts"
	fitnesslogic "study/api/internal/logic/fitness"
)

type ControllerV1 struct{}

func NewV1() *ControllerV1 {
	return &ControllerV1{}
}

func currentUserID(ctx context.Context) int64 {
	return g.RequestFromCtx(ctx).GetCtxVar(consts.CtxKeyUserId).Int64()
}

func toItem(item fitnesslogic.Item) v1.FitnessRecordItem {
	return v1.FitnessRecordItem{
		Id:          item.ID,
		Activity:    item.Activity,
		Minutes:     item.Minutes,
		DistanceKm:  item.DistanceKm,
		Calories:    item.Calories,
		PerformedOn: item.PerformedOn,
		Date:        item.Date,
		Weekday:     item.Weekday,
		Note:        item.Note,
		Color:       item.Color,
	}
}

func toItems(items []fitnesslogic.Item) []v1.FitnessRecordItem {
	result := make([]v1.FitnessRecordItem, 0, len(items))
	for _, item := range items {
		result = append(result, toItem(item))
	}
	return result
}

func toDayStats(days []fitnesslogic.DayStat) []v1.FitnessDayStat {
	result := make([]v1.FitnessDayStat, 0, len(days))
	for _, day := range days {
		result = append(result, v1.FitnessDayStat{
			Date:    day.Date,
			Weekday: day.Weekday,
			Minutes: day.Minutes,
			Level:   day.Level,
		})
	}
	return result
}
