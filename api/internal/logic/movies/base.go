package movies

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

// 观看状态取值与默认颜色。
const (
	StatusWant     = 1 // 想看
	StatusWatching = 2 // 在看
	StatusWatched  = 3 // 已看完

	DefaultColor = "#6389A8"
	maxListSize  = 200
)

var colorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

// Item 一条电影记录。
type Item struct {
	ID         int64
	Title      string
	Year       int
	Genre      string
	Director   string
	Rating     float64
	Status     int
	StatusName string
	Note       string
	Color      string
	Date       string
}

// StatusCount 某个状态下的片单数量。
type StatusCount struct {
	Status int
	Name   string
	Count  int
}

// Overview 电影页所需的全部数据。
type Overview struct {
	Total         int
	WantCount     int
	WatchingCount int
	WatchedCount  int
	AvgRating     float64
	Statuses      []StatusCount
	Items         []Item
}

// StatusName 返回状态的中文名称。
func StatusName(status int) string {
	switch status {
	case StatusWant:
		return "想看"
	case StatusWatching:
		return "在看"
	case StatusWatched:
		return "已看完"
	default:
		return "未分类"
	}
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
