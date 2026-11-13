package inspiration

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// SetPinned 设置或取消灵感置顶。
func SetPinned(ctx context.Context, userID, id int64, pinned bool) error {
	value := 0
	if pinned {
		value = 1
	}
	result, err := g.DB().Exec(ctx, `
		UPDATE inspiration_item SET pinned = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, value, id, userID)
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
