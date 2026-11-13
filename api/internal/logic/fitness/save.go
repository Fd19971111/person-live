package fitness

import (
	"context"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
)

// Save 新增或编辑运动记录，Id 为 0 时表示新增。
func Save(ctx context.Context, userID, id int64, activity string, minutes int, distanceKm float64,
	calories int, performedOn, note, color string) (int64, error) {
	activity = strings.TrimSpace(activity)
	if len([]rune(activity)) == 0 || len([]rune(activity)) > 32 {
		return 0, invalid("运动类型需为 1-32 个字符")
	}
	if minutes < 1 || minutes > 1440 {
		return 0, invalid("运动时长需在 1-1440 分钟之间")
	}
	if distanceKm < 0 || distanceKm > 9999 {
		return 0, invalid("距离需在 0-9999 公里之间")
	}
	if calories < 0 || calories > 20000 {
		return 0, invalid("消耗需在 0-20000 千卡之间")
	}
	day, err := parseDay(performedOn)
	if err != nil {
		return 0, err
	}
	note = strings.TrimSpace(note)
	if len([]rune(note)) > 255 {
		return 0, invalid("备注不能超过 255 个字符")
	}
	color, err = normalizeColor(color)
	if err != nil {
		return 0, err
	}

	if id == 0 {
		result, err := g.DB().Exec(ctx, `
			INSERT INTO fitness_record
				(user_id, activity, minutes, distance_km, calories, performed_on, note, color)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			userID, activity, minutes, distanceKm, calories, dateText(day), note, color)
		if err != nil {
			return 0, err
		}
		return result.LastInsertId()
	}
	owned, err := countSQL(ctx, `
		SELECT COUNT(*) FROM fitness_record
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return 0, err
	}
	if owned == 0 {
		return 0, invalid("记录不存在或已被删除")
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE fitness_record
		SET activity = ?, minutes = ?, distance_km = ?, calories = ?, performed_on = ?, note = ?, color = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
		activity, minutes, distanceKm, calories, dateText(day), note, color, id, userID)
	if err != nil {
		return 0, err
	}
	return id, nil
}
