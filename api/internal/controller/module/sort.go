package module

import (
	"context"

	v1 "study/api/api/module/v1"
	modulelogic "study/api/internal/logic/module"
)

// Sort 模块排序。
func (c *ControllerV1) Sort(ctx context.Context, req *v1.ModuleSortReq) (res *v1.ModuleSortRes, err error) {
	items, err := modulelogic.Sort(ctx, currentUserID(ctx), req.Keys)
	if err != nil {
		return nil, err
	}
	return &v1.ModuleSortRes{Items: toItems(items)}, nil
}
