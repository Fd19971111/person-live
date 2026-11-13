package plan

import (
	"context"

	v1 "study/api/api/plan/v1"
	planlogic "study/api/internal/logic/plan"
)

// MoveTask 移动计划任务。
func (c *ControllerV1) MoveTask(ctx context.Context, req *v1.PlanTaskMoveReq) (res *v1.PlanTaskMoveRes, err error) {
	if err = planlogic.MoveTask(ctx, currentUserID(ctx), req.Id, req.Status, req.SortOrder); err != nil {
		return nil, err
	}
	return &v1.PlanTaskMoveRes{}, nil
}
