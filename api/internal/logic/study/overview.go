package study

import (
	"context"
	"time"

	"github.com/gogf/gf/v2/frame/g"
)

// Overview 学习页总览。
type Overview struct {
	Month              string
	MonthMinutes       int
	MonthTargetMinutes int
	MonthRate          float64
	ChangeMinutes      int
	StreakDays         int
	WeekMinutes        int
	WeekGoalMinutes    int
	WeekRate           float64
	WeekDays           []DayStat
	Heatmap            []DayStat
	Courses            []Course
	Notes              []Note
}

// GetOverview 汇总月度/周度时长、连续天数、热力图、课程与笔记。
func GetOverview(ctx context.Context, userID int64) (*Overview, error) {
	now := time.Now().In(cst)
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, cst)
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, cst)
	nextMonth := monthStart.AddDate(0, 1, 0)
	prevMonth := monthStart.AddDate(0, -1, 0)

	goal, err := GoalMinutes(ctx, userID)
	if err != nil {
		return nil, err
	}
	monthMinutes, err := sumMinutes(ctx, userID, monthStart, nextMonth)
	if err != nil {
		return nil, err
	}
	prevMinutes, err := sumMinutes(ctx, userID, prevMonth, monthStart)
	if err != nil {
		return nil, err
	}

	overview := &Overview{
		Month:              monthStart.Format("2006-01"),
		MonthMinutes:       monthMinutes,
		MonthTargetMinutes: goal * 4,
		ChangeMinutes:      monthMinutes - prevMinutes,
		WeekGoalMinutes:    goal,
	}
	if overview.MonthTargetMinutes > 0 {
		overview.MonthRate = round1(float64(monthMinutes) / float64(overview.MonthTargetMinutes) * 100)
		if overview.MonthRate > 100 {
			overview.MonthRate = 100
		}
	}

	weekStart := mondayOf(today)
	weekEnd := weekStart.AddDate(0, 0, 7)
	if overview.WeekMinutes, err = sumMinutes(ctx, userID, weekStart, weekEnd); err != nil {
		return nil, err
	}
	if goal > 0 {
		overview.WeekRate = round1(float64(overview.WeekMinutes) / float64(goal) * 100)
		if overview.WeekRate > 100 {
			overview.WeekRate = 100
		}
	}

	weekMap, err := dailyMinutes(ctx, userID, weekStart, weekEnd)
	if err != nil {
		return nil, err
	}
	overview.WeekDays = make([]DayStat, 0, 7)
	for offset := 0; offset < 7; offset++ {
		day := weekStart.AddDate(0, 0, offset)
		overview.WeekDays = append(overview.WeekDays, DayStat{
			Date:    dateText(day),
			Weekday: weekdayLabel(day),
			Minutes: weekMap[dateText(day)],
			Level:   heatLevel(weekMap[dateText(day)]),
		})
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

	if overview.StreakDays, err = streakDays(ctx, userID, today); err != nil {
		return nil, err
	}
	if overview.Courses, err = ListCourses(ctx, userID); err != nil {
		return nil, err
	}
	notes, err := ListNotes(ctx, userID)
	if err != nil {
		return nil, err
	}
	if len(notes) > 3 {
		notes = notes[:3]
	}
	overview.Notes = notes
	return overview, nil
}

// streakDays 从今天（或昨天）向前统计连续学习天数。
func streakDays(ctx context.Context, userID int64, today time.Time) (int, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT DATE_FORMAT(studied_on, '%Y-%m-%d') AS day
		FROM study_session
		WHERE user_id = ? AND deleted_at IS NULL AND minutes > 0 AND studied_on <= ?
			AND studied_on >= ?
		GROUP BY studied_on
		ORDER BY studied_on DESC`,
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
