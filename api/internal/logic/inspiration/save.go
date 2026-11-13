package inspiration

import (
	"context"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
)

// Save 新增或编辑灵感，Id 为 0 时表示新增。
func Save(ctx context.Context, userID, id int64, title, content, tag, source, color string, pinned bool) (int64, error) {
	title = strings.TrimSpace(title)
	if len([]rune(title)) == 0 || len([]rune(title)) > 128 {
		return 0, invalid("灵感标题需为 1-128 个字符")
	}
	content = strings.TrimSpace(content)
	if len([]rune(content)) > 2000 {
		return 0, invalid("灵感正文不能超过 2000 个字符")
	}
	tag = strings.TrimSpace(tag)
	if len([]rune(tag)) > 32 {
		return 0, invalid("标签不能超过 32 个字符")
	}
	source = strings.TrimSpace(source)
	if len([]rune(source)) > 255 {
		return 0, invalid("来源不能超过 255 个字符")
	}
	color, err := normalizeColor(color)
	if err != nil {
		return 0, err
	}
	pinnedValue := 0
	if pinned {
		pinnedValue = 1
	}

	if id == 0 {
		result, err := g.DB().Exec(ctx, `
			INSERT INTO inspiration_item
				(user_id, title, content, tag, source, color, pinned)
			VALUES (?, ?, ?, ?, ?, ?, ?)`,
			userID, title, content, tag, source, color, pinnedValue)
		if err != nil {
			return 0, err
		}
		return result.LastInsertId()
	}
	owned, err := countSQL(ctx, `
		SELECT COUNT(*) FROM inspiration_item
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return 0, err
	}
	if owned == 0 {
		return 0, invalid("灵感不存在或已被删除")
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE inspiration_item
		SET title = ?, content = ?, tag = ?, source = ?, color = ?, pinned = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
		title, content, tag, source, color, pinnedValue, id, userID)
	if err != nil {
		return 0, err
	}
	return id, nil
}
