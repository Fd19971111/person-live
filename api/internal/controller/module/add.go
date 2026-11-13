package module

import (
	"context"

	v1 "study/api/api/module/v1"
	modulelogic "study/api/internal/logic/module"
)

// Add 添加或加回模块。
func (c *ControllerV1) Add(ctx context.Context, req *v1.ModuleAddReq) (res *v1.ModuleAddRes, err error) {
	items, err := modulelogic.Add(ctx, currentUserID(ctx), req.Key, req.Name, req.Icon, req.Color, req.Template)
	if err != nil {
		return nil, err
	}
	return &v1.ModuleAddRes{Items: toItems(items)}, nil
}
