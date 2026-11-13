package album

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// List 返回全部照片，最近上传的排在最前。
func List(ctx context.Context, userID int64) ([]Photo, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT id, category, file_name, original_name, size_bytes, note,
		       DATE_FORMAT(DATE_ADD(created_at, INTERVAL 8 HOUR), '%Y-%m-%d') AS day
		FROM album_photo
		WHERE user_id = ? AND deleted_at IS NULL
		ORDER BY created_at DESC, id DESC
		LIMIT ?`, userID, maxListSize)
	if err != nil {
		return nil, err
	}
	photos := make([]Photo, 0, len(rows))
	for _, row := range rows {
		photo := Photo{
			ID:           row["id"].Int64(),
			Category:     row["category"].String(),
			FileName:     row["file_name"].String(),
			OriginalName: row["original_name"].String(),
			SizeBytes:    row["size_bytes"].Int64(),
			Note:         row["note"].String(),
		}
		photo.URL = photoURL(userID, photo.FileName)
		if day, err := parseDay(row["day"].String()); err == nil {
			photo.Date = timestampText(day)
		}
		photos = append(photos, photo)
	}
	return photos, nil
}

// Categories 返回相册分类，未建分类但已有照片的名字也会补在末尾。
func Categories(ctx context.Context, userID int64) ([]Category, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT id, name, color FROM album_category
		WHERE user_id = ? AND deleted_at IS NULL
		ORDER BY sort_order, id`, userID)
	if err != nil {
		return nil, err
	}
	countRows, err := g.DB().GetAll(ctx, `
		SELECT category, COUNT(*) AS total FROM album_photo
		WHERE user_id = ? AND deleted_at IS NULL
		GROUP BY category`, userID)
	if err != nil {
		return nil, err
	}
	counts := make(map[string]int, len(countRows))
	for _, row := range countRows {
		counts[row["category"].String()] = row["total"].Int()
	}

	categories := make([]Category, 0, len(rows))
	seen := make(map[string]bool, len(rows))
	for _, row := range rows {
		name := row["name"].String()
		seen[name] = true
		categories = append(categories, Category{
			ID:    row["id"].Int64(),
			Name:  name,
			Color: row["color"].String(),
			Count: counts[name],
		})
	}
	for name, count := range counts {
		if name == "" || seen[name] {
			continue
		}
		categories = append(categories, Category{Name: name, Color: DefaultCategoryColor, Count: count})
	}
	return categories, nil
}
