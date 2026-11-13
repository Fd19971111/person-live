package study

import (
	"context"
	"strings"
	"time"

	"github.com/gogf/gf/v2/frame/g"
)

// ListSessions 返回学习记录（最多 200 条）及其总时长，month 为空表示全部。
func ListSessions(ctx context.Context, userID int64, month string) ([]Session, int, error) {
	where := []string{"t.user_id = ?", "t.deleted_at IS NULL"}
	args := []any{userID}
	if month = strings.TrimSpace(month); month != "" {
		start, err := time.ParseInLocation("2006-01", month, cst)
		if err != nil {
			return nil, 0, invalid("月份格式应为 YYYY-MM")
		}
		where = append(where, "t.studied_on >= ?", "t.studied_on < ?")
		args = append(args, dateText(start), dateText(start.AddDate(0, 1, 0)))
	}
	condition := strings.Join(where, " AND ")

	total, err := countSQL(ctx, `
		SELECT COALESCE(SUM(t.minutes), 0) FROM study_session t WHERE `+condition, args...)
	if err != nil {
		return nil, 0, err
	}

	rows, err := g.DB().GetAll(ctx, `
		SELECT t.id AS id,
		       DATE_FORMAT(t.studied_on, '%Y-%m-%d') AS day,
		       t.minutes AS minutes,
		       COALESCE(t.course_id, 0) AS course_id,
		       COALESCE(c.title, '未关联课程') AS course,
		       t.note AS note
		FROM study_session t
		LEFT JOIN study_course c ON c.id = t.course_id AND c.deleted_at IS NULL
		WHERE `+condition+`
		ORDER BY t.studied_on DESC, t.id DESC
		LIMIT 200`, args...)
	if err != nil {
		return nil, 0, err
	}
	sessions := make([]Session, 0, len(rows))
	for _, row := range rows {
		sessions = append(sessions, Session{
			ID:       row["id"].Int64(),
			Date:     row["day"].String(),
			Minutes:  row["minutes"].Int(),
			CourseID: row["course_id"].Int64(),
			Course:   row["course"].String(),
			Note:     row["note"].String(),
		})
	}
	return sessions, total, nil
}

// resolveCourse 按名称查找课程，不存在时自动创建。
func resolveCourse(ctx context.Context, userID int64, name string) (int64, error) {
	name = strings.TrimSpace(name)
	if len([]rune(name)) > 64 {
		return 0, invalid("课程名称不能超过 64 个字符")
	}
	value, err := g.DB().GetValue(ctx, `
		SELECT id FROM study_course
		WHERE user_id = ? AND title = ? AND deleted_at IS NULL LIMIT 1`, userID, name)
	if err != nil {
		return 0, err
	}
	if id := value.Int64(); id > 0 {
		return id, nil
	}
	sortOrder, err := countSQL(ctx, `
		SELECT COALESCE(MAX(sort_order), -1) + 1 FROM study_course
		WHERE user_id = ? AND deleted_at IS NULL`, userID)
	if err != nil {
		return 0, err
	}
	result, err := g.DB().Exec(ctx, `
		INSERT INTO study_course (user_id, title, unit_label, total_units, done_units, color, sort_order)
		VALUES (?, ?, ?, 0, 0, ?, ?)`, userID, name, "章", DefaultCourseColor, sortOrder)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

// SaveSession 新增或编辑学习记录，时长单位为分钟。
func SaveSession(ctx context.Context, userID, id int64, date string, minutes int, courseID int64,
	courseName, note string) (int64, error) {
	minutesValue := minutes
	if minutesValue <= 0 || minutesValue > 1440 {
		return 0, invalid("学习时长需在 1-1440 分钟之间")
	}
	day, err := parseDay(date)
	if err != nil {
		return 0, err
	}
	note = strings.TrimSpace(note)
	if len([]rune(note)) > 255 {
		return 0, invalid("备注不能超过 255 个字符")
	}

	if name := strings.TrimSpace(courseName); name != "" {
		if courseID, err = resolveCourse(ctx, userID, name); err != nil {
			return 0, err
		}
	} else if courseID > 0 {
		owned, err := countSQL(ctx, `
			SELECT COUNT(*) FROM study_course
			WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, courseID, userID)
		if err != nil {
			return 0, err
		}
		if owned == 0 {
			return 0, invalid("所选课程不存在")
		}
	} else {
		courseID = 0
	}
	courseValue := any(nil)
	if courseID > 0 {
		courseValue = courseID
	}

	// DATE 列统一传字符串，避免驱动按 UTC 转换后日期串位。
	dayValue := dateText(day)

	if id == 0 {
		result, err := g.DB().Exec(ctx, `
			INSERT INTO study_session (user_id, course_id, minutes, studied_on, note)
			VALUES (?, ?, ?, ?, ?)`, userID, courseValue, minutesValue, dayValue, note)
		if err != nil {
			return 0, err
		}
		return result.LastInsertId()
	}
	owned, err := countSQL(ctx, `
		SELECT COUNT(*) FROM study_session
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return 0, err
	}
	if owned == 0 {
		return 0, invalid("学习记录不存在或已被删除")
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE study_session
		SET course_id = ?, minutes = ?, studied_on = ?, note = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
		courseValue, minutesValue, dayValue, note, id, userID)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// DeleteSession 软删除学习记录。
func DeleteSession(ctx context.Context, userID, id int64) error {
	result, err := g.DB().Exec(ctx, `
		UPDATE study_session SET deleted_at = NOW(3)
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return invalid("学习记录不存在或已被删除")
	}
	return nil
}
