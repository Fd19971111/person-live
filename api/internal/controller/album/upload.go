package album

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/album/v1"
	albumlogic "study/api/internal/logic/album"
)

// UploadPhoto 接收 multipart 上传的照片，字段名为 file。
func (c *ControllerV1) UploadPhoto(ctx context.Context, req *v1.AlbumUploadReq) (res *v1.AlbumUploadRes, err error) {
	r := g.RequestFromCtx(ctx)
	userID := currentUserID(ctx)
	id, err := albumlogic.Upload(ctx, userID, r.Get("category").String(), r.Get("note").String(), r.GetUploadFile("file"))
	if err != nil {
		return nil, err
	}
	return &v1.AlbumUploadRes{Id: id}, nil
}
