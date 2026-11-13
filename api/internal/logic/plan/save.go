package plan

import (
	"context"
	"strings"
	"unicode/utf8"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/gtime"
)

// SaveCategory 新增或编辑计划分类，同名分类不允许重复。
func SaveCategory(ctx context.Context, userID, id int64, name, color string, sortOrder int) (int64, error) {
	name = strings.TrimSpace(name)
	if utf8.RuneCountInString(name) == 0 || utf8.RuneCountInString(name) > 32 {
		return 0, invalid("分类名称需为 1-32 个字符")
	}
	color, err := normalizeColor(color)
	if err != nil {
		return 0, err
	}
	if sortOrder < 0 {
		sortOrder = 0
	}
	count, err := countSQL(ctx, `
		SELECT COUNT(*) FROM plan_category
		WHERE user_id = ? AND name = ? AND deleted_at IS NULL AND id <> ?`, userID, name, id)
	if err != nil {
		return 0, err
	}
	if count > 0 {
		return 0, invalid("已存在同名分类「%s」", name)
	}

	if id == 0 {
		result, err := g.DB().Exec(ctx, `
			INSERT INTO plan_category (user_id, name, color, sort_order)
			VALUES (?, ?, ?, ?)`, userID, name, color, sortOrder)
		if err != nil {
			return 0, err
		}
		return result.LastInsertId()
	}
	owned, err := countSQL(ctx,
		"SELECT COUNT(*) FROM plan_category WHERE id = ? AND user_id = ? AND deleted_at IS NULL", id, userID)
	if err != nil {
		return 0, err
	}
	if owned == 0 {
		return 0, invalid("分类不存在")
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE plan_category SET name = ?, color = ?, sort_order = ?
		WHERE id = ? AND user_id = ?`, name, color, sortOrder, id, userID)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// resolveCategory 按名称查找分类，不存在时自动创建。
func resolveCategory(ctx context.Context, userID int64, name string) (int64, error) {
	name = strings.TrimSpace(name)
	if utf8.RuneCountInString(name) > 32 {
		return 0, invalid("分类名称不能超过 32 个字符")
	}
	value, err := g.DB().GetValue(ctx, `
		SELECT id FROM plan_category
		WHERE user_id = ? AND name = ? AND deleted_at IS NULL LIMIT 1`, userID, name)
	if err != nil {
		return 0, err
	}
	if id := value.Int64(); id > 0 {
		return id, nil
	}
	sortOrder, err := countSQL(ctx,
		"SELECT COALESCE(MAX(sort_order), -1) + 1 FROM plan_category WHERE user_id = ? AND deleted_at IS NULL", userID)
	if err != nil {
		return 0, err
	}
	result, err := g.DB().Exec(ctx, `
		INSERT INTO plan_category (user_id, name, color, sort_order)
		VALUES (?, ?, ?, ?)`, userID, name, DefaultCategoryColor, sortOrder)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

// SaveTask 新增或编辑任务，Id 为 0 时表示新增。
func SaveTask(ctx context.Context, userID, id int64, title, note string, status int, dueDate string,
	categoryID int64, categoryName string) (int64, error) {
	title = strings.TrimSpace(title)
	note = strings.TrimSpace(note)
	if utf8.RuneCountInString(title) == 0 || utf8.RuneCountInString(title) > 128 {
		return 0, invalid("标题需为 1-128 个字符")
	}
	if utf8.RuneCountInString(note) > 512 {
		return 0, invalid("备注不能超过 512 个字符")
	}
	if status < StatusPending || status > StatusDone {
		return 0, invalid("任务状态不正确")
	}
	due, err := parseDue(dueDate)
	if err != nil {
		return 0, err
	}
	if name := strings.TrimSpace(categoryName); name != "" {
		if categoryID, err = resolveCategory(ctx, userID, name); err != nil {
			return 0, err
		}
	} else if categoryID > 0 {
		owned, err := countSQL(ctx, `
			SELECT COUNT(*) FROM plan_category
			WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, categoryID, userID)
		if err != nil {
			return 0, err
		}
		if owned == 0 {
			return 0, invalid("所选分类不存在")
		}
	} else {
		categoryID = 0
	}

	completedAt := any(nil)
	if status == StatusDone {
		completedAt = gtime.Now()
	}
	// DATE 列统一传字符串，避免驱动按 UTC 转换后日期串位。
	dueValue := any(nil)
	if due != nil {
		dueValue = due.Format("2006-01-02")
	}
	categoryValue := any(nil)
	if categoryID > 0 {
		categoryValue = categoryID
	}

	if id == 0 {
		sortOrder, err := countSQL(ctx, `
			SELECT COALESCE(MAX(sort_order), -1) + 1 FROM plan_task
			WHERE user_id = ? AND status = ? AND deleted_at IS NULL`, userID, status)
		if err != nil {
			return 0, err
		}
		result, err := g.DB().Exec(ctx, `
			INSERT INTO plan_task
				(user_id, category_id, title, note, status, due_date, sort_order, completed_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			userID, categoryValue, title, note, status, dueValue, sortOrder, completedAt)
		if err != nil {
			return 0, err
		}
		return result.LastInsertId()
	}

	owned, err := countSQL(ctx, `
		SELECT COUNT(*) FROM plan_task
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return 0, err
	}
	if owned == 0 {
		return 0, invalid("任务不存在或已被删除")
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE plan_task
		SET category_id = ?, title = ?, note = ?, status = ?, due_date = ?, completed_at = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
		categoryValue, title, note, status, dueValue, completedAt, id, userID)
	if err != nil {
		return 0, err
	}
	return id, nil
}
