package study

import (
	"context"

	v1 "study/api/api/study/v1"
	studylogic "study/api/internal/logic/study"
)

// Goal 读取每周学习目标。
func (c *ControllerV1) Goal(ctx context.Context, req *v1.StudyGoalReq) (res *v1.StudyGoalRes, err error) {
	minutes, err := studylogic.GoalMinutes(ctx, currentUserID(ctx))
	if err != nil {
		return nil, err
	}
	return &v1.StudyGoalRes{WeeklyGoalMinutes: minutes}, nil
}

// SaveGoal 保存每周学习目标。
func (c *ControllerV1) SaveGoal(ctx context.Context, req *v1.StudyGoalSaveReq) (res *v1.StudyGoalSaveRes, err error) {
	minutes, err := studylogic.SaveGoal(ctx, currentUserID(ctx), req.WeeklyGoalMinutes)
	if err != nil {
		return nil, err
	}
	return &v1.StudyGoalSaveRes{WeeklyGoalMinutes: minutes}, nil
}
