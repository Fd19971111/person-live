package plan

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// DeleteCategory 软删除计划分类，分类下的任务会显示为「未分类」。
func DeleteCategory(ctx context.Context, userID, id int64) error {
	result, err := g.DB().Exec(ctx, `
		UPDATE plan_category SET deleted_at = NOW(3)
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return invalid("分类不存在或已被删除")
	}
	return nil
}

// DeleteTask 软删除任务。
func DeleteTask(ctx context.Context, userID, id int64) error {
	result, err := g.DB().Exec(ctx, `
		UPDATE plan_task SET deleted_at = NOW(3)
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return invalid("任务不存在或已被删除")
	}
	return nil
}
