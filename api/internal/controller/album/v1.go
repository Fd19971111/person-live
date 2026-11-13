package album

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/album/v1"
	"study/api/internal/consts"
	albumlogic "study/api/internal/logic/album"
)

type ControllerV1 struct{}

func NewV1() *ControllerV1 {
	return &ControllerV1{}
}

func currentUserID(ctx context.Context) int64 {
	return g.RequestFromCtx(ctx).GetCtxVar(consts.CtxKeyUserId).Int64()
}

func toPhoto(item albumlogic.Photo) v1.AlbumPhotoItem {
	return v1.AlbumPhotoItem{
		Id:        item.ID,
		Url:       item.URL,
		Category:  item.Category,
		Name:      item.OriginalName,
		Note:      item.Note,
		SizeBytes: item.SizeBytes,
		SizeText:  albumlogic.SizeText(item.SizeBytes),
		Date:      item.Date,
	}
}

func toPhotos(items []albumlogic.Photo) []v1.AlbumPhotoItem {
	result := make([]v1.AlbumPhotoItem, 0, len(items))
	for _, item := range items {
		result = append(result, toPhoto(item))
	}
	return result
}

func toCategories(items []albumlogic.Category) []v1.AlbumCategoryItem {
	result := make([]v1.AlbumCategoryItem, 0, len(items))
	for _, item := range items {
		result = append(result, v1.AlbumCategoryItem{
			Id:    item.ID,
			Name:  item.Name,
			Color: item.Color,
			Count: item.Count,
		})
	}
	return result
}
