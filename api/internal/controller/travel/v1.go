package travel

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/travel/v1"
	"study/api/internal/consts"
	travellogic "study/api/internal/logic/travel"
)

type ControllerV1 struct{}

func NewV1() *ControllerV1 {
	return &ControllerV1{}
}

func currentUserID(ctx context.Context) int64 {
	return g.RequestFromCtx(ctx).GetCtxVar(consts.CtxKeyUserId).Int64()
}

func toItem(item travellogic.Item) v1.TravelTripItem {
	return v1.TravelTripItem{
		Id:        item.ID,
		Title:     item.Title,
		Region:    item.Region,
		VisitedOn: item.VisitedOn,
		Date:      item.Date,
		Year:      item.Year,
		Days:      item.Days,
		Rating:    item.Rating,
		Note:      item.Note,
		Color:     item.Color,
	}
}

func toItems(items []travellogic.Item) []v1.TravelTripItem {
	result := make([]v1.TravelTripItem, 0, len(items))
	for _, item := range items {
		result = append(result, toItem(item))
	}
	return result
}
