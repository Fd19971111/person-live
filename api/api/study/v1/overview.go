package v1

import "github.com/gogf/gf/v2/frame/g"

// StudyCourseItem 学习课程。
type StudyCourseItem struct {
	Id         int64  `json:"id"`
	Title      string `json:"title"`
	UnitLabel  string `json:"unitLabel"`
	TotalUnits int    `json:"totalUnits"`
	DoneUnits  int    `json:"doneUnits"`
	Progress   int    `json:"progress"`
	Color      string `json:"color"`
	SortOrder  int    `json:"sortOrder"`
}

// StudyNoteItem 学习笔记。
type StudyNoteItem struct {
	Id      int64  `json:"id"`
	Title   string `json:"title"`
	Tag     string `json:"tag"`
	Content string `json:"content"`
	Date    string `json:"date"`
}

// StudyDayStat 单日学习时长，Level 为热力图的 0-4 档。
type StudyDayStat struct {
	Date    string `json:"date"`
	Weekday string `json:"weekday"`
	Minutes int    `json:"minutes"`
	Level   int    `json:"level"`
}

// StudyOverviewReq 学习总览。
type StudyOverviewReq struct {
	g.Meta `path:"/study/overview" method:"get" tags:"学习" summary:"学习总览"`
}

// StudyOverviewRes 学习页所需的全部数据。
type StudyOverviewRes struct {
	Month              string            `json:"month"`
	MonthMinutes       int               `json:"monthMinutes"`
	MonthTargetMinutes int               `json:"monthTargetMinutes"`
	MonthRate          float64           `json:"monthRate"`
	ChangeMinutes      int               `json:"changeMinutes"`
	StreakDays         int               `json:"streakDays"`
	WeekMinutes        int               `json:"weekMinutes"`
	WeekGoalMinutes    int               `json:"weekGoalMinutes"`
	WeekRate           float64           `json:"weekRate"`
	WeekDays           []StudyDayStat    `json:"weekDays"`
	Heatmap            []StudyDayStat    `json:"heatmap"`
	Courses            []StudyCourseItem `json:"courses"`
	Notes              []StudyNoteItem   `json:"notes"`
}
