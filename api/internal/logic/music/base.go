package music

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/gogf/gf/v2/errors/gcode"
	"github.com/gogf/gf/v2/errors/gerror"
	"github.com/gogf/gf/v2/frame/g"
)

// cst 当前只服务国内用户，日期边界按东八区计算。
var cst = time.FixedZone("CST", 8*3600)

// 音乐域默认颜色与列表上限。
const (
	DefaultColor    = "#9B72D2"
	maxListSize     = 200
	maxPlaylistRows = 8
)

var colorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

// Item 一条音乐记录。
type Item struct {
	ID       int64
	Title    string
	Artist   string
	Album    string
	Playlist string
	Rating   int
	Note     string
	Color    string
	Date     string
}

// PlaylistCount 歌单及其曲目数量。
type PlaylistCount struct {
	Name  string
	Count int
}

// Overview 音乐页所需的全部数据。
type Overview struct {
	Total         int
	PlaylistCount int
	ArtistCount   int
	AvgRating     float64
	Playlists     []PlaylistCount
	Items         []Item
}

func invalid(format string, args ...any) error {
	return gerror.NewCode(gcode.CodeInvalidParameter, fmt.Sprintf(format, args...))
}

func countSQL(ctx context.Context, query string, args ...any) (int, error) {
	value, err := g.DB().GetValue(ctx, query, args...)
	if err != nil {
		return 0, err
	}
	return value.Int(), nil
}

func round1(value float64) float64 {
	return float64(int64(value*10+0.5)) / 10
}

func normalizeColor(color string) (string, error) {
	color = strings.TrimSpace(color)
	if color == "" {
		return DefaultColor, nil
	}
	if !colorPattern.MatchString(color) {
		return "", invalid("颜色需为 #RRGGBB 格式")
	}
	return strings.ToLower(color), nil
}

func timestampText(day time.Time) string {
	return fmt.Sprintf("%d月%d日", day.Month(), day.Day())
}

// parseDay 解析 YYYY-MM-DD，统一落在当天零点。
func parseDay(value string) (time.Time, error) {
	value = strings.TrimSpace(value)
	if len(value) > 10 {
		value = value[:10]
	}
	for _, layout := range []string{"2006-01-02", "2006-1-2"} {
		if parsed, err := time.ParseInLocation(layout, value, cst); err == nil {
			return parsed, nil
		}
	}
	return time.Time{}, invalid("日期格式应为 YYYY-MM-DD")
}
