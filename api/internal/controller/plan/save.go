package plan

import (
	"context"

	v1 "study/api/api/plan/v1"
	planlogic "study/api/internal/logic/plan"
)

// SaveCategory 新增或编辑计划分类。
func (c *ControllerV1) SaveCategory(ctx context.Context, req *v1.PlanCategorySaveReq) (res *v1.PlanCategorySaveRes, err error) {
	id, err := planlogic.SaveCategory(ctx, currentUserID(ctx), req.Id, req.Name, req.Color, req.SortOrder)
	if err != nil {
		return nil, err
	}
	return &v1.PlanCategorySaveRes{Id: id}, nil
}

// SaveTask 新增或编辑计划任务。
func (c *ControllerV1) SaveTask(ctx context.Context, req *v1.PlanTaskSaveReq) (res *v1.PlanTaskSaveRes, err error) {
	id, err := planlogic.SaveTask(ctx, currentUserID(ctx), req.Id, req.Title, req.Note, req.Status,
		req.DueDate, req.CategoryId, req.CategoryName)
	if err != nil {
		return nil, err
	}
	return &v1.PlanTaskSaveRes{Id: id}, nil
}
