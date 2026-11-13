package inspiration

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/inspiration/v1"
	"study/api/internal/consts"
	inspirationlogic "study/api/internal/logic/inspiration"
)

type ControllerV1 struct{}

func NewV1() *ControllerV1 {
	return &ControllerV1{}
}

func currentUserID(ctx context.Context) int64 {
	return g.RequestFromCtx(ctx).GetCtxVar(consts.CtxKeyUserId).Int64()
}

func toItem(item inspirationlogic.Item) v1.InspirationItem {
	return v1.InspirationItem{
		Id:      item.ID,
		Title:   item.Title,
		Content: item.Content,
		Tag:     item.Tag,
		Source:  item.Source,
		Color:   item.Color,
		Pinned:  item.Pinned,
		Date:    item.Date,
	}
}

func toItems(items []inspirationlogic.Item) []v1.InspirationItem {
	result := make([]v1.InspirationItem, 0, len(items))
	for _, item := range items {
		result = append(result, toItem(item))
	}
	return result
}

func toTags(tags []inspirationlogic.TagCount) []v1.InspirationTag {
	result := make([]v1.InspirationTag, 0, len(tags))
	for _, tag := range tags {
		result = append(result, v1.InspirationTag{Name: tag.Name, Count: tag.Count})
	}
	return result
}
