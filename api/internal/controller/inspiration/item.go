package inspiration

import (
	"context"

	v1 "study/api/api/inspiration/v1"
	inspirationlogic "study/api/internal/logic/inspiration"
)

// SaveItem 新增或编辑灵感。
func (c *ControllerV1) SaveItem(ctx context.Context, req *v1.InspirationItemSaveReq) (res *v1.InspirationItemSaveRes, err error) {
	id, err := inspirationlogic.Save(ctx, currentUserID(ctx), req.Id,
		req.Title, req.Content, req.Tag, req.Source, req.Color, req.Pinned)
	if err != nil {
		return nil, err
	}
	return &v1.InspirationItemSaveRes{Id: id}, nil
}

// DeleteItem 删除灵感（软删除）。
func (c *ControllerV1) DeleteItem(ctx context.Context, req *v1.InspirationItemDeleteReq) (res *v1.InspirationItemDeleteRes, err error) {
	if err = inspirationlogic.Delete(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.InspirationItemDeleteRes{}, nil
}

// PinItem 设置或取消置顶。
func (c *ControllerV1) PinItem(ctx context.Context, req *v1.InspirationItemPinReq) (res *v1.InspirationItemPinRes, err error) {
	if err = inspirationlogic.SetPinned(ctx, currentUserID(ctx), req.Id, req.Pinned); err != nil {
		return nil, err
	}
	return &v1.InspirationItemPinRes{}, nil
}
