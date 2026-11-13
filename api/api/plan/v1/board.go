package v1

import "github.com/gogf/gf/v2/frame/g"

// PlanBoardReq 看板数据，同时返回三列任务、本周进度与时间轴。
type PlanBoardReq struct {
	g.Meta `path:"/plan/board" method:"get" tags:"计划" summary:"计划看板数据"`
	Week   string `json:"week" in:"query" dc:"本周内任意日期 YYYY-MM-DD，默认当天所在周"`
}

// PlanWeek 当前展示的周区间。
type PlanWeek struct {
	Start string `json:"start"`
	End   string `json:"end"`
	Label string `json:"label"`
}

// PlanBoardSummary 本周进度。
type PlanBoardSummary struct {
	Total int     `json:"total"`
	Done  int     `json:"done"`
	Rate  float64 `json:"rate"`
}

// PlanColumn 看板中的一列。
type PlanColumn struct {
	Status int            `json:"status"`
	Name   string         `json:"name"`
	Count  int            `json:"count"`
	Items  []PlanTaskItem `json:"items"`
}

// PlanDay 时间轴中的一天。
type PlanDay struct {
	Date    string         `json:"date"`
	Label   string         `json:"label"`
	Weekday string         `json:"weekday"`
	Day     int            `json:"day"`
	Items   []PlanTaskItem `json:"items"`
}

// PlanBoardRes 计划页所需的全部数据。
type PlanBoardRes struct {
	Week       PlanWeek        `json:"week"`
	Summary    PlanBoardSummary `json:"summary"`
	Categories []PlanCategoryItem `json:"categories"`
	Columns    []PlanColumn    `json:"columns"`
	Timeline   []PlanDay       `json:"timeline"`
}
