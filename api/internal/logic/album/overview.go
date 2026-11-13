package album

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// GetOverview 相册页所需的统计数据、分类与照片列表。
func GetOverview(ctx context.Context, userID int64) (Overview, error) {
	overview := Overview{}

	photos, err := List(ctx, userID)
	if err != nil {
		return overview, err
	}
	categories, err := Categories(ctx, userID)
	if err != nil {
		return overview, err
	}
	overview.Photos = photos
	overview.Categories = categories

	total, err := countSQL(ctx, `
		SELECT COUNT(*) FROM album_photo WHERE user_id = ? AND deleted_at IS NULL`, userID)
	if err != nil {
		return overview, err
	}
	overview.Total = total

	size, err := g.DB().GetValue(ctx, `
		SELECT IFNULL(SUM(size_bytes), 0) FROM album_photo
		WHERE user_id = ? AND deleted_at IS NULL`, userID)
	if err != nil {
		return overview, err
	}
	overview.SizeBytes = size.Int64()
	return overview, nil
}
