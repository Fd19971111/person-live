package movies

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/movies/v1"
	"study/api/internal/consts"
	movieslogic "study/api/internal/logic/movies"
)

type ControllerV1 struct{}

func NewV1() *ControllerV1 {
	return &ControllerV1{}
}

func currentUserID(ctx context.Context) int64 {
	return g.RequestFromCtx(ctx).GetCtxVar(consts.CtxKeyUserId).Int64()
}

func toItem(item movieslogic.Item) v1.MovieItem {
	return v1.MovieItem{
		Id:         item.ID,
		Title:      item.Title,
		Year:       item.Year,
		Genre:      item.Genre,
		Director:   item.Director,
		Rating:     item.Rating,
		Status:     item.Status,
		StatusName: item.StatusName,
		Note:       item.Note,
		Color:      item.Color,
		Date:       item.Date,
	}
}

func toItems(items []movieslogic.Item) []v1.MovieItem {
	result := make([]v1.MovieItem, 0, len(items))
	for _, item := range items {
		result = append(result, toItem(item))
	}
	return result
}

func toStatuses(statuses []movieslogic.StatusCount) []v1.MovieStatusCount {
	result := make([]v1.MovieStatusCount, 0, len(statuses))
	for _, status := range statuses {
		result = append(result, v1.MovieStatusCount{
			Status: status.Status,
			Name:   status.Name,
			Count:  status.Count,
		})
	}
	return result
}
