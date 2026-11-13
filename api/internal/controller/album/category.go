package album

import (
	"context"

	v1 "study/api/api/album/v1"
	albumlogic "study/api/internal/logic/album"
)

// SaveCategory 新建或修改相册分类。
func (c *ControllerV1) SaveCategory(ctx context.Context, req *v1.AlbumCategorySaveReq) (res *v1.AlbumCategorySaveRes, err error) {
	id, err := albumlogic.SaveCategory(ctx, currentUserID(ctx), req.Id, req.Name, req.Color)
	if err != nil {
		return nil, err
	}
	return &v1.AlbumCategorySaveRes{Id: id}, nil
}

// DeleteCategory 删除相册分类。
func (c *ControllerV1) DeleteCategory(ctx context.Context, req *v1.AlbumCategoryDeleteReq) (res *v1.AlbumCategoryDeleteRes, err error) {
	if err = albumlogic.DeleteCategory(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.AlbumCategoryDeleteRes{}, nil
}
