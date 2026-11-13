package travel

import (
	"context"

	v1 "study/api/api/travel/v1"
	travellogic "study/api/internal/logic/travel"
)

// SaveTrip 新增或编辑旅行足迹。
func (c *ControllerV1) SaveTrip(ctx context.Context, req *v1.TravelTripSaveReq) (res *v1.TravelTripSaveRes, err error) {
	id, err := travellogic.Save(ctx, currentUserID(ctx), req.Id, req.Title, req.Region,
		req.VisitedOn, req.Days, req.Rating, req.Note, req.Color)
	if err != nil {
		return nil, err
	}
	return &v1.TravelTripSaveRes{Id: id}, nil
}

// DeleteTrip 删除旅行足迹（软删除）。
func (c *ControllerV1) DeleteTrip(ctx context.Context, req *v1.TravelTripDeleteReq) (res *v1.TravelTripDeleteRes, err error) {
	if err = travellogic.Delete(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.TravelTripDeleteRes{}, nil
}
