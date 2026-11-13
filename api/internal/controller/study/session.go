package study

import (
	"context"

	v1 "study/api/api/study/v1"
	studylogic "study/api/internal/logic/study"
)

// Sessions 学习记录列表。
func (c *ControllerV1) Sessions(ctx context.Context, req *v1.StudySessionsReq) (res *v1.StudySessionsRes, err error) {
	sessions, total, err := studylogic.ListSessions(ctx, currentUserID(ctx), req.Month)
	if err != nil {
		return nil, err
	}
	return &v1.StudySessionsRes{Items: toSessionItems(sessions), TotalMinutes: total}, nil
}

// SaveSession 新增或编辑学习记录。
func (c *ControllerV1) SaveSession(ctx context.Context, req *v1.StudySessionSaveReq) (res *v1.StudySessionSaveRes, err error) {
	id, err := studylogic.SaveSession(ctx, currentUserID(ctx), req.Id, req.Date, req.Minutes,
		req.CourseId, req.CourseName, req.Note)
	if err != nil {
		return nil, err
	}
	return &v1.StudySessionSaveRes{Id: id}, nil
}

// DeleteSession 删除学习记录（软删除）。
func (c *ControllerV1) DeleteSession(ctx context.Context, req *v1.StudySessionDeleteReq) (res *v1.StudySessionDeleteRes, err error) {
	if err = studylogic.DeleteSession(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.StudySessionDeleteRes{}, nil
}
