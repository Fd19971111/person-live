package study

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

// 学习域的默认取值与统计窗口。
const (
	DefaultWeeklyGoalMinutes = 360
	DefaultCourseColor       = "#5F6E9C"
	heatmapDays              = 112
)

var colorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

// Course 学习课程及其进度。
type Course struct {
	ID         int64
	Title      string
	UnitLabel  string
	TotalUnits int
	DoneUnits  int
	Progress   int
	Color      string
	SortOrder  int
}

// Session 一条学习记录。
type Session struct {
	ID       int64
	Date     string
	Minutes  int
	CourseID int64
	Course   string
	Note     string
}

// Note 学习笔记。
type Note struct {
	ID      int64
	Title   string
	Tag     string
	Content string
	Date    string
}

// DayStat 单日学习数据。
type DayStat struct {
	Date    string
	Weekday string
	Minutes int
	Level   int
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
		return DefaultCourseColor, nil
	}
	if !colorPattern.MatchString(color) {
		return "", invalid("颜色需为 #RRGGBB 格式")
	}
	return strings.ToLower(color), nil
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

func dateText(day time.Time) string {
	return day.Format("2006-01-02")
}

func timestampText(day time.Time) string {
	return fmt.Sprintf("%d月%d日", day.Month(), day.Day())
}

var weekdayLabels = [...]string{"日", "一", "二", "三", "四", "五", "六"}

func weekdayLabel(day time.Time) string {
	return weekdayLabels[int(day.Weekday())]
}

// mondayOf 返回所在周的周一零点。
func mondayOf(day time.Time) time.Time {
	offset := (int(day.Weekday()) + 6) % 7
	return day.AddDate(0, 0, -offset)
}

// heatLevel 把分钟数映射为热力图的 0-4 档。
func heatLevel(minutes int) int {
	switch {
	case minutes <= 0:
		return 0
	case minutes < 30:
		return 1
	case minutes < 60:
		return 2
	case minutes < 90:
		return 3
	default:
		return 4
	}
}

// dailyMinutes 返回区间内每天的学习分钟数。
func dailyMinutes(ctx context.Context, userID int64, start, end time.Time) (map[string]int, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT DATE_FORMAT(studied_on, '%Y-%m-%d') AS day,
		       COALESCE(SUM(minutes), 0) AS total
		FROM study_session
		WHERE user_id = ? AND deleted_at IS NULL AND studied_on >= ? AND studied_on < ?
		GROUP BY studied_on`, userID, dateText(start), dateText(end))
	if err != nil {
		return nil, err
	}
	result := make(map[string]int, len(rows))
	for _, row := range rows {
		result[row["day"].String()] = row["total"].Int()
	}
	return result, nil
}

func sumMinutes(ctx context.Context, userID int64, start, end time.Time) (int, error) {
	value, err := g.DB().GetValue(ctx, `
		SELECT COALESCE(SUM(minutes), 0) FROM study_session
		WHERE user_id = ? AND deleted_at IS NULL AND minutes > 0
			AND studied_on >= ? AND studied_on < ?`, userID, dateText(start), dateText(end))
	if err != nil {
		return 0, err
	}
	return value.Int(), nil
}
