package album

import (
	"context"

	v1 "study/api/api/album/v1"
	albumlogic "study/api/internal/logic/album"
)

// SavePhoto 修改照片所属相册与备注。
func (c *ControllerV1) SavePhoto(ctx context.Context, req *v1.AlbumPhotoSaveReq) (res *v1.AlbumPhotoSaveRes, err error) {
	if err = albumlogic.SavePhoto(ctx, currentUserID(ctx), req.Id, req.Category, req.Note); err != nil {
		return nil, err
	}
	return &v1.AlbumPhotoSaveRes{Id: req.Id}, nil
}

// DeletePhoto 删除照片（软删除并移除本地文件）。
func (c *ControllerV1) DeletePhoto(ctx context.Context, req *v1.AlbumPhotoDeleteReq) (res *v1.AlbumPhotoDeleteRes, err error) {
	if err = albumlogic.DeletePhoto(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.AlbumPhotoDeleteRes{}, nil
}
