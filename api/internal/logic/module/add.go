package module

import (
	"context"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
)

// Add 添加模块；如果该模块之前被删除（隐藏），则重新加回并排到末尾。
func Add(ctx context.Context, userID int64, key, name, icon, color, template string) ([]Module, error) {
	if err := ensure(ctx, userID); err != nil {
		return nil, err
	}
	key = strings.TrimSpace(key)
	if key == "" {
		return nil, invalid("缺少模块标识")
	}

	entry, inCatalog := lookup(key)
	if name = strings.TrimSpace(name); name == "" {
		if !inCatalog {
			return nil, invalid("未知模块「%s」", key)
		}
		name = entry.Name
	}
	if icon = strings.TrimSpace(icon); icon == "" {
		icon = entry.Icon
	}
	if icon == "" {
		icon = "layout"
	}
	if color = strings.TrimSpace(color); color == "" {
		color = entry.Color
	}
	if color == "" {
		color = DefaultColor
	}
	if template = strings.TrimSpace(template); template == "" {
		template = entry.Template
	}
	if template == "" {
		template = "CardFlow"
	}

	record, err := g.DB().Model("user_module").Ctx(ctx).
		Where("user_id", userID).Where("module_key", key).One()
	if err != nil {
		return nil, err
	}
	if record.IsEmpty() {
		sortOrder, err := nextSortOrder(ctx, userID)
		if err != nil {
			return nil, err
		}
		if _, err = g.DB().Exec(ctx, `
			INSERT INTO user_module
				(user_id, module_key, name, icon, color, template, sort_order, hidden)
			VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
			userID, key, name, icon, color, template, sortOrder); err != nil {
			return nil, err
		}
		return list(ctx, userID)
	}

	if record["hidden"].Int() == 0 {
		return list(ctx, userID)
	}
	sortOrder, err := nextSortOrder(ctx, userID)
	if err != nil {
		return nil, err
	}
	if _, err = g.DB().Exec(ctx, `
		UPDATE user_module SET hidden = 0, sort_order = ?
		WHERE user_id = ? AND module_key = ?`, sortOrder, userID, key); err != nil {
		return nil, err
	}
	return list(ctx, userID)
}
