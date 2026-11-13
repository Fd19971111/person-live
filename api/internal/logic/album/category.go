package album

import (
	"context"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
)

// ensureCategory 上传或改分类时自动补建相册，已存在则什么都不做。
func ensureCategory(ctx context.Context, userID int64, name string) error {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil
	}
	existing, err := countSQL(ctx, `
		SELECT COUNT(*) FROM album_category
		WHERE user_id = ? AND name = ? AND deleted_at IS NULL`, userID, name)
	if err != nil {
		return err
	}
	if existing > 0 {
		return nil
	}
	sortOrder, err := g.DB().GetValue(ctx, `
		SELECT IFNULL(MAX(sort_order), -1) + 1 FROM album_category WHERE user_id = ?`, userID)
	if err != nil {
		return err
	}
	_, err = g.DB().Exec(ctx, `
		INSERT INTO album_category (user_id, name, color, sort_order)
		VALUES (?, ?, ?, ?)`, userID, name, DefaultCategoryColor, sortOrder.Int())
	return err
}

// SaveCategory 新建或重命名相册，重命名时同步照片上的相册名。
func SaveCategory(ctx context.Context, userID, id int64, name, color string) (int64, error) {
	name, err := normalizeCategory(name)
	if err != nil {
		return 0, err
	}
	if name == "" {
		return 0, invalid("请填写相册名")
	}
	color, err = normalizeColor(color)
	if err != nil {
		return 0, err
	}

	if id == 0 {
		duplicated, err := countSQL(ctx, `
			SELECT COUNT(*) FROM album_category
			WHERE user_id = ? AND name = ? AND deleted_at IS NULL`, userID, name)
		if err != nil {
			return 0, err
		}
		if duplicated > 0 {
			return 0, invalid("已经有同名相册了")
		}
		sortOrder, err := g.DB().GetValue(ctx, `
			SELECT IFNULL(MAX(sort_order), -1) + 1 FROM album_category WHERE user_id = ?`, userID)
		if err != nil {
			return 0, err
		}
		result, err := g.DB().Exec(ctx, `
			INSERT INTO album_category (user_id, name, color, sort_order)
			VALUES (?, ?, ?, ?)`, userID, name, color, sortOrder.Int())
		if err != nil {
			return 0, err
		}
		return result.LastInsertId()
	}

	row, err := g.DB().GetOne(ctx, `
		SELECT name FROM album_category
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return 0, err
	}
	if row.IsEmpty() {
		return 0, invalid("相册不存在或已被删除")
	}
	oldName := row["name"].String()
	if oldName != name {
		duplicated, err := countSQL(ctx, `
			SELECT COUNT(*) FROM album_category
			WHERE user_id = ? AND name = ? AND id <> ? AND deleted_at IS NULL`, userID, name, id)
		if err != nil {
			return 0, err
		}
		if duplicated > 0 {
			return 0, invalid("已经有同名相册了")
		}
		if _, err = g.DB().Exec(ctx, `
			UPDATE album_photo SET category = ?
			WHERE user_id = ? AND category = ? AND deleted_at IS NULL`, name, userID, oldName); err != nil {
			return 0, err
		}
	}
	if _, err = g.DB().Exec(ctx, `
		UPDATE album_category SET name = ?, color = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, name, color, id, userID); err != nil {
		return 0, err
	}
	return id, nil
}

// DeleteCategory 删除相册，照片本身保留并回到未分类。
func DeleteCategory(ctx context.Context, userID, id int64) error {
	row, err := g.DB().GetOne(ctx, `
		SELECT name FROM album_category
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	if row.IsEmpty() {
		return invalid("相册不存在或已被删除")
	}
	if _, err = g.DB().Exec(ctx, `
		UPDATE album_photo SET category = ''
		WHERE user_id = ? AND category = ? AND deleted_at IS NULL`, userID, row["name"].String()); err != nil {
		return err
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE album_category SET deleted_at = NOW(3)
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	return err
}
