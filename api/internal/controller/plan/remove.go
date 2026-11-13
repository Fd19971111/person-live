package plan

import (
	"context"

	v1 "study/api/api/plan/v1"
	planlogic "study/api/internal/logic/plan"
)

// DeleteCategory 删除计划分类（软删除）。
func (c *ControllerV1) DeleteCategory(ctx context.Context, req *v1.PlanCategoryDeleteReq) (res *v1.PlanCategoryDeleteRes, err error) {
	if err = planlogic.DeleteCategory(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.PlanCategoryDeleteRes{}, nil
}

// DeleteTask 删除计划任务（软删除）。
func (c *ControllerV1) DeleteTask(ctx context.Context, req *v1.PlanTaskDeleteReq) (res *v1.PlanTaskDeleteRes, err error) {
	if err = planlogic.DeleteTask(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.PlanTaskDeleteRes{}, nil
}
