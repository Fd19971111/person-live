package album

import (
	"context"
	"os"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/gfile"
)

// SavePhoto 修改照片所属相册与备注。
func SavePhoto(ctx context.Context, userID, id int64, category, note string) error {
	category, err := normalizeCategory(category)
	if err != nil {
		return err
	}
	note, err = normalizeNote(note)
	if err != nil {
		return err
	}
	if id <= 0 {
		return invalid("照片不存在或已被删除")
	}

	owned, err := countSQL(ctx, `
		SELECT COUNT(*) FROM album_photo
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	if owned == 0 {
		return invalid("照片不存在或已被删除")
	}

	if _, err = g.DB().Exec(ctx, `
		UPDATE album_photo SET category = ?, note = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
		category, note, id, userID); err != nil {
		return err
	}
	return ensureCategory(ctx, userID, category)
}

// DeletePhoto 软删除照片，并移除磁盘上的文件。
func DeletePhoto(ctx context.Context, userID, id int64) error {
	row, err := g.DB().GetOne(ctx, `
		SELECT file_name FROM album_photo
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	if row.IsEmpty() {
		return invalid("照片不存在或已被删除")
	}
	if _, err = g.DB().Exec(ctx, `
		UPDATE album_photo SET deleted_at = NOW(3)
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID); err != nil {
		return err
	}
	_ = os.Remove(gfile.Join(UserDir(userID), row["file_name"].String()))
	return nil
}
