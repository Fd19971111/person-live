package movies

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// Delete 软删除电影。
func Delete(ctx context.Context, userID, id int64) error {
	result, err := g.DB().Exec(ctx, `
		UPDATE movie_item SET deleted_at = NOW(3)
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return invalid("电影不存在或已被删除")
	}
	return nil
}

// SetStatus 快捷切换观看状态。
func SetStatus(ctx context.Context, userID, id int64, status int) error {
	if status != StatusWant && status != StatusWatching && status != StatusWatched {
		return invalid("观看状态不正确")
	}
	result, err := g.DB().Exec(ctx, `
		UPDATE movie_item SET status = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, status, id, userID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return invalid("电影不存在或已被删除")
	}
	return nil
}
