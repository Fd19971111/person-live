package module

import (
	"context"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
)

// Hide 删除模块，仅标记为隐藏，之后可从模块库中加回。
func Hide(ctx context.Context, userID int64, key string) ([]Module, error) {
	if err := ensure(ctx, userID); err != nil {
		return nil, err
	}
	key = strings.TrimSpace(key)
	if key == "" {
		return nil, invalid("缺少模块标识")
	}
	result, err := g.DB().Exec(ctx, `
		UPDATE user_module SET hidden = 1
		WHERE user_id = ? AND module_key = ? AND hidden = 0`, userID, key)
	if err != nil {
		return nil, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return nil, err
	}
	if affected == 0 {
		return nil, invalid("模块不存在或已隐藏")
	}
	return list(ctx, userID)
}

// nextSortOrder 返回模块追加到末尾时使用的排序值。
func nextSortOrder(ctx context.Context, userID int64) (int, error) {
	value, err := g.DB().GetValue(ctx,
		"SELECT COALESCE(MAX(sort_order), -1) + 1 FROM user_module WHERE user_id = ?", userID)
	if err != nil {
		return 0, err
	}
	return value.Int(), nil
}
