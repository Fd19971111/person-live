package module

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/module/v1"
	"study/api/internal/consts"
	modulelogic "study/api/internal/logic/module"
)

type ControllerV1 struct{}

func NewV1() *ControllerV1 {
	return &ControllerV1{}
}

func currentUserID(ctx context.Context) int64 {
	return g.RequestFromCtx(ctx).GetCtxVar(consts.CtxKeyUserId).Int64()
}

func toItems(modules []modulelogic.Module) []v1.ModuleItem {
	items := make([]v1.ModuleItem, 0, len(modules))
	for _, item := range modules {
		items = append(items, v1.ModuleItem{
			Key:       item.Key,
			Name:      item.Name,
			Icon:      item.Icon,
			Color:     item.Color,
			Template:  item.Template,
			SortOrder: item.SortOrder,
			Hidden:    item.Hidden,
		})
	}
	return items
}
