package plan

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// MoveTask 把任务移动到目标状态与位置，sortOrder 为 -1 时排到该列末尾。
func MoveTask(ctx context.Context, userID, id int64, status, sortOrder int) error {
	if status < StatusPending || status > StatusDone {
		return invalid("任务状态不正确")
	}
	owned, err := countSQL(ctx, `
		SELECT COUNT(*) FROM plan_task
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	if owned == 0 {
		return invalid("任务不存在或已被删除")
	}
	if sortOrder < 0 {
		if sortOrder, err = countSQL(ctx, `
			SELECT COALESCE(MAX(sort_order), -1) + 1 FROM plan_task
			WHERE user_id = ? AND status = ? AND deleted_at IS NULL AND id <> ?`, userID, status, id); err != nil {
			return err
		}
	}

	if status == StatusDone {
		_, err = g.DB().Exec(ctx, `
			UPDATE plan_task
			SET status = ?, sort_order = ?, completed_at = COALESCE(completed_at, NOW(3))
			WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, status, sortOrder, id, userID)
		return err
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE plan_task SET status = ?, sort_order = ?, completed_at = NULL
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, status, sortOrder, id, userID)
	return err
}
