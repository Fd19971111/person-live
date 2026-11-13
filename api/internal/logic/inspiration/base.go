package inspiration

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

// 灵感域的默认取值与列表上限。
const (
	DefaultColor = "#9B72D2"
	maxListSize  = 200
	maxTagRows   = 8
)

var colorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

// Item 一条灵感收藏。
type Item struct {
	ID      int64
	Title   string
	Content string
	Tag     string
	Source  string
	Color   string
	Pinned  bool
	Date    string
}

// TagCount 标签及其灵感数量。
type TagCount struct {
	Name  string
	Count int
}

// Overview 灵感页所需的全部数据。
type Overview struct {
	Total       int
	MonthAdded  int
	PinnedCount int
	TagTotal    int
	Tags        []TagCount
	Items       []Item
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
