package fitness

import (
	"context"

	v1 "study/api/api/fitness/v1"
	fitnesslogic "study/api/internal/logic/fitness"
)

// SaveRecord 新增或编辑运动记录。
func (c *ControllerV1) SaveRecord(ctx context.Context, req *v1.FitnessRecordSaveReq) (res *v1.FitnessRecordSaveRes, err error) {
	id, err := fitnesslogic.Save(ctx, currentUserID(ctx), req.Id, req.Activity, req.Minutes,
		req.DistanceKm, req.Calories, req.PerformedOn, req.Note, req.Color)
	if err != nil {
		return nil, err
	}
	return &v1.FitnessRecordSaveRes{Id: id}, nil
}

// DeleteRecord 删除运动记录（软删除）。
func (c *ControllerV1) DeleteRecord(ctx context.Context, req *v1.FitnessRecordDeleteReq) (res *v1.FitnessRecordDeleteRes, err error) {
	if err = fitnesslogic.Delete(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.FitnessRecordDeleteRes{}, nil
}
