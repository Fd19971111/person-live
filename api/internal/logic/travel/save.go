package travel

import (
	"context"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
)

// Save 新增或编辑旅行足迹，Id 为 0 时表示新增。
func Save(ctx context.Context, userID, id int64, title, region, visitedOn string,
	days, rating int, note, color string) (int64, error) {
	title = strings.TrimSpace(title)
	if len([]rune(title)) == 0 || len([]rune(title)) > 128 {
		return 0, invalid("目的地需为 1-128 个字符")
	}
	region = strings.TrimSpace(region)
	if len([]rune(region)) > 64 {
		return 0, invalid("省份 / 国家不能超过 64 个字符")
	}
	day, err := parseDay(visitedOn)
	if err != nil {
		return 0, err
	}
	if days < 1 || days > 365 {
		return 0, invalid("行程天数需在 1-365 之间")
	}
	if rating < 0 || rating > 5 {
		return 0, invalid("评分需在 0-5 之间")
	}
	note = strings.TrimSpace(note)
	if len([]rune(note)) > 500 {
		return 0, invalid("备注不能超过 500 个字符")
	}
	color, err = normalizeColor(color)
	if err != nil {
		return 0, err
	}

	if id == 0 {
		result, err := g.DB().Exec(ctx, `
			INSERT INTO travel_trip
				(user_id, title, region, visited_on, days, rating, note, color)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			userID, title, region, dateText(day), days, rating, note, color)
		if err != nil {
			return 0, err
		}
		return result.LastInsertId()
	}
	owned, err := countSQL(ctx, `
		SELECT COUNT(*) FROM travel_trip
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return 0, err
	}
	if owned == 0 {
		return 0, invalid("足迹不存在或已被删除")
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE travel_trip
		SET title = ?, region = ?, visited_on = ?, days = ?, rating = ?, note = ?, color = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
		title, region, dateText(day), days, rating, note, color, id, userID)
	if err != nil {
		return 0, err
	}
	return id, nil
}
