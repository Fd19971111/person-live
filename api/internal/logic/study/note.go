package study

import (
	"context"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
)

// ListNotes 返回最近的笔记，最新的排在最前。
func ListNotes(ctx context.Context, userID int64) ([]Note, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT id, title, tag, content,
		       DATE_FORMAT(DATE_ADD(created_at, INTERVAL 8 HOUR), '%Y-%m-%d') AS day
		FROM study_note
		WHERE user_id = ? AND deleted_at IS NULL
		ORDER BY created_at DESC, id DESC
		LIMIT 60`, userID)
	if err != nil {
		return nil, err
	}
	notes := make([]Note, 0, len(rows))
	for _, row := range rows {
		note := Note{
			ID:      row["id"].Int64(),
			Title:   row["title"].String(),
			Tag:     row["tag"].String(),
			Content: row["content"].String(),
		}
		if day, err := parseDay(row["day"].String()); err == nil {
			note.Date = timestampText(day)
		}
		notes = append(notes, note)
	}
	return notes, nil
}

// SaveNote 新增或编辑笔记。
func SaveNote(ctx context.Context, userID, id int64, title, tag, content string) (int64, error) {
	title = strings.TrimSpace(title)
	if len([]rune(title)) == 0 || len([]rune(title)) > 128 {
		return 0, invalid("笔记标题需为 1-128 个字符")
	}
	tag = strings.TrimSpace(tag)
	if len([]rune(tag)) > 32 {
		return 0, invalid("标签不能超过 32 个字符")
	}
	content = strings.TrimSpace(content)
	if len([]rune(content)) > 2000 {
		return 0, invalid("笔记内容不能超过 2000 个字符")
	}

	if id == 0 {
		result, err := g.DB().Exec(ctx, `
			INSERT INTO study_note (user_id, title, tag, content)
			VALUES (?, ?, ?, ?)`, userID, title, tag, content)
		if err != nil {
			return 0, err
		}
		return result.LastInsertId()
	}
	owned, err := countSQL(ctx, `
		SELECT COUNT(*) FROM study_note
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return 0, err
	}
	if owned == 0 {
		return 0, invalid("笔记不存在或已被删除")
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE study_note SET title = ?, tag = ?, content = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, title, tag, content, id, userID)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// DeleteNote 软删除笔记。
func DeleteNote(ctx context.Context, userID, id int64) error {
	result, err := g.DB().Exec(ctx, `
		UPDATE study_note SET deleted_at = NOW(3)
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return invalid("笔记不存在或已被删除")
	}
	return nil
}
