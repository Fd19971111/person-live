package study

import (
	"context"
	"math"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
)

// ListCourses 返回当前用户的课程与学习进度。
func ListCourses(ctx context.Context, userID int64) ([]Course, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT id, title, unit_label, total_units, done_units, color, sort_order
		FROM study_course
		WHERE user_id = ? AND deleted_at IS NULL
		ORDER BY sort_order, id`, userID)
	if err != nil {
		return nil, err
	}
	courses := make([]Course, 0, len(rows))
	for _, row := range rows {
		course := Course{
			ID:         row["id"].Int64(),
			Title:      row["title"].String(),
			UnitLabel:  row["unit_label"].String(),
			TotalUnits: row["total_units"].Int(),
			DoneUnits:  row["done_units"].Int(),
			Color:      row["color"].String(),
			SortOrder:  row["sort_order"].Int(),
		}
		if course.TotalUnits > 0 {
			course.Progress = int(math.Round(float64(course.DoneUnits) / float64(course.TotalUnits) * 100))
			if course.Progress > 100 {
				course.Progress = 100
			}
		}
		courses = append(courses, course)
	}
	return courses, nil
}

// SaveCourse 新增或编辑课程，已完成数量不能超过总数量。
func SaveCourse(ctx context.Context, userID, id int64, title, unitLabel string, totalUnits, doneUnits int,
	color string, sortOrder int) (int64, error) {
	title = strings.TrimSpace(title)
	if len([]rune(title)) == 0 || len([]rune(title)) > 64 {
		return 0, invalid("课程名称需为 1-64 个字符")
	}
	unitLabel = strings.TrimSpace(unitLabel)
	if unitLabel == "" {
		unitLabel = "章"
	}
	if len([]rune(unitLabel)) > 8 {
		return 0, invalid("进度单位不能超过 8 个字符")
	}
	if totalUnits < 0 || totalUnits > 1000 {
		return 0, invalid("总进度需在 0-1000 之间")
	}
	if doneUnits < 0 {
		doneUnits = 0
	}
	if doneUnits > totalUnits {
		return 0, invalid("已完成数量不能超过总进度")
	}
	color, err := normalizeColor(color)
	if err != nil {
		return 0, err
	}
	if sortOrder < 0 {
		sortOrder = 0
	}

	if id == 0 {
		result, err := g.DB().Exec(ctx, `
			INSERT INTO study_course
				(user_id, title, unit_label, total_units, done_units, color, sort_order)
			VALUES (?, ?, ?, ?, ?, ?, ?)`,
			userID, title, unitLabel, totalUnits, doneUnits, color, sortOrder)
		if err != nil {
			return 0, err
		}
		return result.LastInsertId()
	}
	owned, err := countSQL(ctx, `
		SELECT COUNT(*) FROM study_course
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return 0, err
	}
	if owned == 0 {
		return 0, invalid("课程不存在或已被删除")
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE study_course
		SET title = ?, unit_label = ?, total_units = ?, done_units = ?, color = ?, sort_order = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
		title, unitLabel, totalUnits, doneUnits, color, sortOrder, id, userID)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// DeleteCourse 软删除课程，历史学习记录会保留。
func DeleteCourse(ctx context.Context, userID, id int64) error {
	result, err := g.DB().Exec(ctx, `
		UPDATE study_course SET deleted_at = NOW(3)
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return invalid("课程不存在或已被删除")
	}
	return nil
}
