package movies

import (
	"context"

	v1 "study/api/api/movies/v1"
	movieslogic "study/api/internal/logic/movies"
)

// SaveItem 新增或编辑电影。
func (c *ControllerV1) SaveItem(ctx context.Context, req *v1.MovieItemSaveReq) (res *v1.MovieItemSaveRes, err error) {
	id, err := movieslogic.Save(ctx, currentUserID(ctx), req.Id, req.Title, req.Year,
		req.Genre, req.Director, req.Rating, req.Status, req.Note, req.Color)
	if err != nil {
		return nil, err
	}
	return &v1.MovieItemSaveRes{Id: id}, nil
}

// DeleteItem 删除电影（软删除）。
func (c *ControllerV1) DeleteItem(ctx context.Context, req *v1.MovieItemDeleteReq) (res *v1.MovieItemDeleteRes, err error) {
	if err = movieslogic.Delete(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.MovieItemDeleteRes{}, nil
}

// SetStatus 切换观看状态。
func (c *ControllerV1) SetStatus(ctx context.Context, req *v1.MovieItemStatusReq) (res *v1.MovieItemStatusRes, err error) {
	if err = movieslogic.SetStatus(ctx, currentUserID(ctx), req.Id, req.Status); err != nil {
		return nil, err
	}
	return &v1.MovieItemStatusRes{}, nil
}
