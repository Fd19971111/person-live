package plan

import (
	"context"
	"time"
)

// Week 展示的周区间。
type Week struct {
	Start string
	End   string
	Label string
}

// Summary 本周进度。
type Summary struct {
	Total int
	Done  int
	Rate  float64
}

// Column 看板中的一列。
type Column struct {
	Status int
	Name   string
	Count  int
	Items  []Task
}

// Day 时间轴中的一天。
type Day struct {
	Date    string
	Label   string
	Weekday string
	Day     int
	Items   []Task
}

// Board 计划页所需的全部数据。
type Board struct {
	Week       Week
	Summary    Summary
	Categories []Category
	Columns    []Column
	Timeline   []Day
}

var weekdayLabels = [...]string{"日", "一", "二", "三", "四", "五", "六"}

// GetBoard 汇总看板、时间轴与本周进度，week 为空时取本周。
func GetBoard(ctx context.Context, userID int64, week string) (*Board, error) {
	start, end, err := weekRange(week)
	if err != nil {
		return nil, err
	}
	categories, err := ListCategories(ctx, userID)
	if err != nil {
		return nil, err
	}
	tasks, err := ListTasks(ctx, userID, TaskQuery{})
	if err != nil {
		return nil, err
	}

	board := &Board{
		Week:       Week{Start: start.Format("2006-01-02"), End: end.Format("2006-01-02"), Label: weekLabel(start, end)},
		Categories: categories,
		Columns:    make([]Column, 0, 3),
		Timeline:   make([]Day, 0, 7),
	}
	for _, status := range []int{StatusPending, StatusDoing, StatusDone} {
		board.Columns = append(board.Columns, Column{Status: status, Name: StatusName(status), Items: make([]Task, 0)})
	}

	byStatus := make(map[int]int, 3)
	for i, column := range board.Columns {
		byStatus[column.Status] = i
	}

	startDay := start
	endDay := end
	for _, task := range tasks {
		if index, ok := byStatus[task.Status]; ok {
			board.Columns[index].Items = append(board.Columns[index].Items, task)
		}
		if task.DueDate == "" {
			continue
		}
		due, err := time.ParseInLocation("2006-01-02", task.DueDate, cst)
		if err != nil {
			continue
		}
		if due.Before(startDay) || due.After(endDay) {
			continue
		}
		board.Summary.Total++
		if task.Status == StatusDone {
			board.Summary.Done++
		}
	}

	for index := range board.Columns {
		board.Columns[index].Count = len(board.Columns[index].Items)
	}
	if board.Summary.Total > 0 {
		board.Summary.Rate = round1(float64(board.Summary.Done) / float64(board.Summary.Total) * 100)
	}

	for offset := 0; offset < 7; offset++ {
		day := start.AddDate(0, 0, offset)
		board.Timeline = append(board.Timeline, Day{
			Date:    day.Format("2006-01-02"),
			Label:   day.Format("01-02"),
			Weekday: weekdayLabels[int(day.Weekday())],
			Day:     day.Day(),
			Items:   make([]Task, 0),
		})
	}
	for _, task := range tasks {
		if task.DueDate == "" {
			continue
		}
		for index := range board.Timeline {
			if board.Timeline[index].Date == task.DueDate {
				board.Timeline[index].Items = append(board.Timeline[index].Items, task)
				break
			}
		}
	}
	return board, nil
}
