package album

import (
	"context"

	v1 "study/api/api/album/v1"
	albumlogic "study/api/internal/logic/album"
)

// Overview 相册总览。
func (c *ControllerV1) Overview(ctx context.Context, req *v1.AlbumOverviewReq) (res *v1.AlbumOverviewRes, err error) {
	overview, err := albumlogic.GetOverview(ctx, currentUserID(ctx))
	if err != nil {
		return nil, err
	}
	return &v1.AlbumOverviewRes{
		Total:      overview.Total,
		SizeBytes:  overview.SizeBytes,
		SizeText:   albumlogic.SizeText(overview.SizeBytes),
		Categories: toCategories(overview.Categories),
		Photos:     toPhotos(overview.Photos),
	}, nil
}
