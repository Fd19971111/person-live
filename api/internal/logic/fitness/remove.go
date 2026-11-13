package fitness

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// Delete 软删除运动记录。
func Delete(ctx context.Context, userID, id int64) error {
	result, err := g.DB().Exec(ctx, `
		UPDATE fitness_record SET deleted_at = NOW(3)
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return invalid("记录不存在或已被删除")
	}
	return nil
}
