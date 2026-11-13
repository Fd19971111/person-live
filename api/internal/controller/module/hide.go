package module

import (
	"context"

	v1 "study/api/api/module/v1"
	modulelogic "study/api/internal/logic/module"
)

// Hide 删除（隐藏）模块。
func (c *ControllerV1) Hide(ctx context.Context, req *v1.ModuleHideReq) (res *v1.ModuleHideRes, err error) {
	items, err := modulelogic.Hide(ctx, currentUserID(ctx), req.Key)
	if err != nil {
		return nil, err
	}
	return &v1.ModuleHideRes{Items: toItems(items)}, nil
}
