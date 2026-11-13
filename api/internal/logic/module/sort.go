package module

import (
	"context"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
)

// Sort 按给定顺序重排侧边栏模块，未出现在列表中的模块排在已列出的模块之后。
func Sort(ctx context.Context, userID int64, keys []string) ([]Module, error) {
	if err := ensure(ctx, userID); err != nil {
		return nil, err
	}
	for index, key := range keys {
		key = strings.TrimSpace(key)
		if key == "" {
			continue
		}
		if _, err := g.DB().Exec(ctx, `
			UPDATE user_module SET sort_order = ?
			WHERE user_id = ? AND module_key = ?`, index, userID, key); err != nil {
			return nil, err
		}
	}
	// 重新连续编号，避免没参与排序的模块与已有顺序撞号导致下次读取顺序漂移。
	if err := renumber(ctx, userID); err != nil {
		return nil, err
	}
	return list(ctx, userID)
}

// renumber 按当前顺序值（同值时按 id）把模块的 sort_order 压成 0..n-1。
func renumber(ctx context.Context, userID int64) error {
	rows, err := g.DB().GetAll(ctx, `
		SELECT id FROM user_module WHERE user_id = ?
		ORDER BY sort_order, id`, userID)
	if err != nil {
		return err
	}
	for index, row := range rows {
		if _, err = g.DB().Exec(ctx, `
			UPDATE user_module SET sort_order = ? WHERE id = ?`, index, row["id"].Int64()); err != nil {
			return err
		}
	}
	return nil
}
