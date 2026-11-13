package plan

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

// 任务状态取值。
const (
	StatusPending = 1 // 待处理
	StatusDoing   = 2 // 进行中
	StatusDone    = 3 // 已完成
)

// DefaultCategoryColor 新建分类的默认颜色。
const DefaultCategoryColor = "#6C9E8D"

var colorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

// StatusName 返回状态的中文名称。
func StatusName(status int) string {
	switch status {
	case StatusPending:
		return "待处理"
	case StatusDoing:
		return "进行中"
	case StatusDone:
		return "已完成"
	default:
		return "未分类"
	}
}

// Category 计划分类及其任务数量。
type Category struct {
	ID        int64
	Name      string
	Color     string
	SortOrder int
	TaskCount int
}

// Task 计划任务。
type Task struct {
	ID         int64
	Title      string
	Note       string
	Status     int
	DueDate    string
	CategoryID int64
	Category   string
	Color      string
	SortOrder  int
}

// TaskQuery 任务筛选条件。
type TaskQuery struct {
	Status     int
	CategoryID int64
	Keyword    string
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
		return DefaultCategoryColor, nil
	}
	if !colorPattern.MatchString(color) {
		return "", invalid("颜色需为 #RRGGBB 格式")
	}
	return strings.ToLower(color), nil
}

// parseDue 解析截止日期，空字符串表示无期限。
func parseDue(value string) (*time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return nil, nil
	}
	if len(value) > 10 {
		value = value[:10]
	}
	for _, layout := range []string{"2006-01-02", "2006-1-2"} {
		if parsed, err := time.ParseInLocation(layout, value, cst); err == nil {
			return &parsed, nil
		}
	}
	return nil, invalid("日期格式应为 YYYY-MM-DD")
}

// weekRange 计算 week 所在周的周一到周日，week 为空时取本周。
func weekRange(week string) (time.Time, time.Time, error) {
	day := time.Now().In(cst)
	if week = strings.TrimSpace(week); week != "" {
		parsed, err := parseDue(week)
		if err != nil {
			return time.Time{}, time.Time{}, err
		}
		day = *parsed
	}
	day = time.Date(day.Year(), day.Month(), day.Day(), 0, 0, 0, 0, cst)
	offset := (int(day.Weekday()) + 6) % 7 // 周一为一周起点
	start := day.AddDate(0, 0, -offset)
	return start, start.AddDate(0, 0, 6), nil
}

// weekLabel 生成「10月 21 — 27日」这类展示文本。
func weekLabel(start, end time.Time) string {
	if start.Month() == end.Month() {
		return fmt.Sprintf("%d月 %d — %d日", start.Month(), start.Day(), end.Day())
	}
	if start.Year() == end.Year() {
		return fmt.Sprintf("%d月 %d — %d月 %d日", start.Month(), start.Day(), end.Month(), end.Day())
	}
	return fmt.Sprintf("%d年%d月%d日 — %d年%d月%d日",
		start.Year(), start.Month(), start.Day(), end.Year(), end.Month(), end.Day())
}

func round1(value float64) float64 {
	return float64(int64(value*10+0.5)) / 10
}
