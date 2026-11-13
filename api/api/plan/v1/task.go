package v1

import "github.com/gogf/gf/v2/frame/g"

// PlanTaskItem 计划任务。
type PlanTaskItem struct {
	Id         int64  `json:"id"`
	Title      string `json:"title"`
	Note       string `json:"note"`
	Status     int    `json:"status"`
	StatusName string `json:"statusName"`
	DueDate    string `json:"dueDate"`
	CategoryId int64  `json:"categoryId"`
	Category   string `json:"category"`
	Color      string `json:"color"`
	SortOrder  int    `json:"sortOrder"`
}

// PlanTasksReq 任务列表，支持状态、分类与关键字筛选。
type PlanTasksReq struct {
	g.Meta     `path:"/plan/tasks" method:"get" tags:"计划" summary:"计划任务列表"`
	Status     int    `json:"status"     in:"query" dc:"0 全部 1 待处理 2 进行中 3 已完成"`
	CategoryId int64  `json:"categoryId" in:"query" dc:"0 全部"`
	Keyword    string `json:"keyword"    in:"query"`
}

type PlanTasksRes struct {
	Items []PlanTaskItem `json:"items"`
}

// PlanTaskSaveReq 新增或编辑任务，Id 为 0 时表示新增。
type PlanTaskSaveReq struct {
	g.Meta       `path:"/plan/task/save" method:"post" tags:"计划" summary:"保存计划任务"`
	Id           int64  `json:"id"`
	Title        string `json:"title"`
	Note         string `json:"note"`
	Status       int    `json:"status" dc:"1 待处理 2 进行中 3 已完成"`
	DueDate      string `json:"dueDate" dc:"截止日期 YYYY-MM-DD，可留空"`
	CategoryId   int64  `json:"categoryId"`
	CategoryName string `json:"categoryName" dc:"分类名称，不存在时自动创建"`
}

type PlanTaskSaveRes struct {
	Id int64 `json:"id"`
}

// PlanTaskMoveReq 任务在列之间移动或调整顺序。
type PlanTaskMoveReq struct {
	g.Meta    `path:"/plan/task/move" method:"post" tags:"计划" summary:"移动计划任务"`
	Id        int64 `json:"id"`
	Status    int   `json:"status" dc:"目标状态"`
	SortOrder int   `json:"sortOrder" dc:"目标位置，-1 表示排到末尾"`
}

type PlanTaskMoveRes struct{}

// PlanTaskDeleteReq 删除任务，仅做软删除（隐藏）。
type PlanTaskDeleteReq struct {
	g.Meta `path:"/plan/task/delete" method:"post" tags:"计划" summary:"删除计划任务"`
	Id     int64 `json:"id"`
}

type PlanTaskDeleteRes struct{}
