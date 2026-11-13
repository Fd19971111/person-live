package v1

import "github.com/gogf/gf/v2/frame/g"

// FitnessRecordItem 一条运动记录。
type FitnessRecordItem struct {
	Id          int64   `json:"id"`
	Activity    string  `json:"activity"`
	Minutes     int     `json:"minutes"`
	DistanceKm  float64 `json:"distanceKm"`
	Calories    int     `json:"calories"`
	PerformedOn string  `json:"performedOn"`
	Date        string  `json:"date"`
	Weekday     string  `json:"weekday"`
	Note        string  `json:"note"`
	Color       string  `json:"color"`
}

// FitnessDayStat 单日运动量，Level 为热力图的 0-4 档。
type FitnessDayStat struct {
	Date    string `json:"date"`
	Weekday string `json:"weekday"`
	Minutes int    `json:"minutes"`
	Level   int    `json:"level"`
}

// FitnessOverviewReq 运动记录总览。
type FitnessOverviewReq struct {
	g.Meta `path:"/fitness/overview" method:"get" tags:"运动" summary:"运动记录总览"`
}

// FitnessOverviewRes 运动页所需的全部数据。
type FitnessOverviewRes struct {
	Total        int                 `json:"total"`
	TotalMinutes int                 `json:"totalMinutes"`
	WeekMinutes  int                 `json:"weekMinutes"`
	MonthMinutes int                 `json:"monthMinutes"`
	StreakDays   int                 `json:"streakDays"`
	Heatmap      []FitnessDayStat    `json:"heatmap"`
	Items        []FitnessRecordItem `json:"items"`
}
