package music

import (
	"context"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
)

// Save 新增或编辑音乐记录，Id 为 0 时表示新增。
func Save(ctx context.Context, userID, id int64, title, artist, album, playlist string,
	rating int, note, color string) (int64, error) {
	title = strings.TrimSpace(title)
	if len([]rune(title)) == 0 || len([]rune(title)) > 128 {
		return 0, invalid("歌曲名需为 1-128 个字符")
	}
	artist = strings.TrimSpace(artist)
	if len([]rune(artist)) > 64 {
		return 0, invalid("演唱者不能超过 64 个字符")
	}
	album = strings.TrimSpace(album)
	if len([]rune(album)) > 128 {
		return 0, invalid("专辑或来源不能超过 128 个字符")
	}
	playlist = strings.TrimSpace(playlist)
	if len([]rune(playlist)) > 32 {
		return 0, invalid("歌单名不能超过 32 个字符")
	}
	if rating < 0 || rating > 5 {
		return 0, invalid("评分需在 0-5 之间")
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
			INSERT INTO music_track
				(user_id, title, artist, album, playlist, rating, note, color)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			userID, title, artist, album, playlist, rating, note, color)
		if err != nil {
			return 0, err
		}
		return result.LastInsertId()
	}
	owned, err := countSQL(ctx, `
		SELECT COUNT(*) FROM music_track
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return 0, err
	}
	if owned == 0 {
		return 0, invalid("音乐记录不存在或已被删除")
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE music_track
		SET title = ?, artist = ?, album = ?, playlist = ?, rating = ?, note = ?, color = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
		title, artist, album, playlist, rating, note, color, id, userID)
	if err != nil {
		return 0, err
	}
	return id, nil
}
