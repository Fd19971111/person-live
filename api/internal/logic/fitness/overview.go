package fitness

import (
	"context"
	"time"

	"github.com/gogf/gf/v2/frame/g"
)

// GetOverview 汇总时长、连续天数与热力图。
func GetOverview(ctx context.Context, userID int64) (*Overview, error) {
	now := time.Now().In(cst)
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, cst)
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, cst)
	nextMonth := monthStart.AddDate(0, 1, 0)

	overview := &Overview{}

	total, err := countSQL(ctx, `
		SELECT COUNT(*) FROM fitness_record
		WHERE user_id = ? AND deleted_at IS NULL`, userID)
	if err != nil {
		return nil, err
	}
	overview.Total = total
	value, err := g.DB().GetValue(ctx, `
		SELECT COALESCE(SUM(minutes), 0) FROM fitness_record
		WHERE user_id = ? AND deleted_at IS NULL`, userID)
	if err != nil {
		return nil, err
	}
	overview.TotalMinutes = value.Int()

	weekStart := mondayOf(today)
	if overview.WeekMinutes, err = sumMinutes(ctx, userID, weekStart, weekStart.AddDate(0, 0, 7)); err != nil {
		return nil, err
	}
	if overview.MonthMinutes, err = sumMinutes(ctx, userID, monthStart, nextMonth); err != nil {
		return nil, err
	}

	if overview.StreakDays, err = streakDays(ctx, userID, today); err != nil {
		return nil, err
	}

	heatStart := today.AddDate(0, 0, -(heatmapDays - 1))
	heatMap, err := dailyMinutes(ctx, userID, heatStart, today.AddDate(0, 0, 1))
	if err != nil {
		return nil, err
	}
	overview.Heatmap = make([]DayStat, 0, heatmapDays)
	for offset := 0; offset < heatmapDays; offset++ {
		day := heatStart.AddDate(0, 0, offset)
		minutes := heatMap[dateText(day)]
		overview.Heatmap = append(overview.Heatmap, DayStat{
			Date:    dateText(day),
			Weekday: weekdayLabel(day),
			Minutes: minutes,
			Level:   heatLevel(minutes),
		})
	}

	if overview.Items, err = List(ctx, userID); err != nil {
		return nil, err
	}
	return overview, nil
}

// streakDays 从今天（或昨天）向前统计连续运动天数。
func streakDays(ctx context.Context, userID int64, today time.Time) (int, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT DATE_FORMAT(performed_on, '%Y-%m-%d') AS day
		FROM fitness_record
		WHERE user_id = ? AND deleted_at IS NULL AND minutes > 0 AND performed_on <= ?
			AND performed_on >= ?
		GROUP BY performed_on
		ORDER BY performed_on DESC`,
		userID, dateText(today), dateText(today.AddDate(0, 0, -400)))
	if err != nil {
		return 0, err
	}
	days := make(map[string]bool, len(rows))
	for _, row := range rows {
		days[row["day"].String()] = true
	}

	cursor := today
	if !days[dateText(cursor)] {
		cursor = cursor.AddDate(0, 0, -1)
	}
	streak := 0
	for days[dateText(cursor)] {
		streak++
		cursor = cursor.AddDate(0, 0, -1)
	}
	return streak, nil
}
