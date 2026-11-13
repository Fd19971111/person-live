package module

import (
	"context"

	v1 "study/api/api/module/v1"
	modulelogic "study/api/internal/logic/module"
)

// List 模块列表。
func (c *ControllerV1) List(ctx context.Context, req *v1.ModuleListReq) (res *v1.ModuleListRes, err error) {
	items, err := modulelogic.GetList(ctx, currentUserID(ctx))
	if err != nil {
		return nil, err
	}
	return &v1.ModuleListRes{Items: toItems(items)}, nil
}
