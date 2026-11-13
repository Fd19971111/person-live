package plan

import (
	"context"

	v1 "study/api/api/plan/v1"
	planlogic "study/api/internal/logic/plan"
)

// Categories 计划分类列表。
func (c *ControllerV1) Categories(ctx context.Context, req *v1.PlanCategoriesReq) (res *v1.PlanCategoriesRes, err error) {
	list, err := planlogic.ListCategories(ctx, currentUserID(ctx))
	if err != nil {
		return nil, err
	}
	return &v1.PlanCategoriesRes{Items: toCategoryItems(list)}, nil
}

// Tasks 计划任务列表。
func (c *ControllerV1) Tasks(ctx context.Context, req *v1.PlanTasksReq) (res *v1.PlanTasksRes, err error) {
	items, err := planlogic.ListTasks(ctx, currentUserID(ctx), planlogic.TaskQuery{
		Status:     req.Status,
		CategoryID: req.CategoryId,
		Keyword:    req.Keyword,
	})
	if err != nil {
		return nil, err
	}
	return &v1.PlanTasksRes{Items: toTaskItems(items)}, nil
}
