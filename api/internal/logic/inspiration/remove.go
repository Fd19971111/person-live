package inspiration

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// Delete 软删除灵感，收藏记录可在数据库层面恢复。
func Delete(ctx context.Context, userID, id int64) error {
	result, err := g.DB().Exec(ctx, `
		UPDATE inspiration_item SET deleted_at = NOW(3)
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return invalid("灵感不存在或已被删除")
	}
	return nil
}
