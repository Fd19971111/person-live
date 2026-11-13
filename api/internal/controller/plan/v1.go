package plan

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/plan/v1"
	"study/api/internal/consts"
	planlogic "study/api/internal/logic/plan"
)

type ControllerV1 struct{}

func NewV1() *ControllerV1 {
	return &ControllerV1{}
}

func currentUserID(ctx context.Context) int64 {
	return g.RequestFromCtx(ctx).GetCtxVar(consts.CtxKeyUserId).Int64()
}

func toTaskItems(tasks []planlogic.Task) []v1.PlanTaskItem {
	items := make([]v1.PlanTaskItem, 0, len(tasks))
	for _, task := range tasks {
		items = append(items, v1.PlanTaskItem{
			Id:         task.ID,
			Title:      task.Title,
			Note:       task.Note,
			Status:     task.Status,
			StatusName: planlogic.StatusName(task.Status),
			DueDate:    task.DueDate,
			CategoryId: task.CategoryID,
			Category:   task.Category,
			Color:      task.Color,
			SortOrder:  task.SortOrder,
		})
	}
	return items
}

func toCategoryItems(categories []planlogic.Category) []v1.PlanCategoryItem {
	items := make([]v1.PlanCategoryItem, 0, len(categories))
	for _, category := range categories {
		items = append(items, v1.PlanCategoryItem{
			Id:        category.ID,
			Name:      category.Name,
			Color:     category.Color,
			SortOrder: category.SortOrder,
			TaskCount: category.TaskCount,
		})
	}
	return items
}
