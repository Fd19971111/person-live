package movies

import (
	"context"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
)

// Save 新增或编辑电影，Id 为 0 时表示新增。
func Save(ctx context.Context, userID, id int64, title string, year int, genre, director string,
	rating float64, status int, note, color string) (int64, error) {
	title = strings.TrimSpace(title)
	if len([]rune(title)) == 0 || len([]rune(title)) > 128 {
		return 0, invalid("电影名称需为 1-128 个字符")
	}
	if year < 0 || year > 2100 {
		return 0, invalid("上映年份需在 0-2100 之间")
	}
	genre = strings.TrimSpace(genre)
	if len([]rune(genre)) > 32 {
		return 0, invalid("类型不能超过 32 个字符")
	}
	director = strings.TrimSpace(director)
	if len([]rune(director)) > 64 {
		return 0, invalid("导演不能超过 64 个字符")
	}
	if rating < 0 || rating > 10 {
		return 0, invalid("评分需在 0-10 之间")
	}
	rating = round1(rating)
	if status != StatusWant && status != StatusWatching && status != StatusWatched {
		status = StatusWant
	}
	note = strings.TrimSpace(note)
	if len([]rune(note)) > 500 {
		return 0, invalid("备注不能超过 500 个字符")
	}
	color, err := normalizeColor(color)
	if err != nil {
		return 0, err
	}

	if id == 0 {
		result, err := g.DB().Exec(ctx, `
			INSERT INTO movie_item
				(user_id, title, year, genre, director, rating, status, note, color)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			userID, title, year, genre, director, rating, status, note, color)
		if err != nil {
			return 0, err
		}
		return result.LastInsertId()
	}
	owned, err := countSQL(ctx, `
		SELECT COUNT(*) FROM movie_item
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return 0, err
	}
	if owned == 0 {
		return 0, invalid("电影不存在或已被删除")
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE movie_item
		SET title = ?, year = ?, genre = ?, director = ?, rating = ?, status = ?, note = ?, color = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
		title, year, genre, director, rating, status, note, color, id, userID)
	if err != nil {
		return 0, err
	}
	return id, nil
}
