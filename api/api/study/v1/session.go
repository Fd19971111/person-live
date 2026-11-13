package v1

import "github.com/gogf/gf/v2/frame/g"

// StudySessionItem 一条学习记录。
type StudySessionItem struct {
	Id       int64  `json:"id"`
	Date     string `json:"date"`
	Minutes  int    `json:"minutes"`
	CourseId int64  `json:"courseId"`
	Course   string `json:"course"`
	Note     string `json:"note"`
}

// StudySessionsReq 学习记录列表，可选月份筛选。
type StudySessionsReq struct {
	g.Meta `path:"/study/sessions" method:"get" tags:"学习" summary:"学习记录列表"`
	Month  string `json:"month" in:"query" dc:"月份 YYYY-MM，空表示全部"`
}

type StudySessionsRes struct {
	Items        []StudySessionItem `json:"items"`
	TotalMinutes int                `json:"totalMinutes"`
}

// StudySessionSaveReq 新增或编辑学习记录，Id 为 0 时表示新增。
type StudySessionSaveReq struct {
	g.Meta    `path:"/study/session/save" method:"post" tags:"学习" summary:"保存学习记录"`
	Id        int64  `json:"id"`
	Date      string `json:"date" dc:"学习日期 YYYY-MM-DD"`
	Minutes   int    `json:"minutes"`
	CourseId  int64  `json:"courseId"`
	CourseName string `json:"courseName" dc:"课程名称，不存在时自动创建"`
	Note      string `json:"note"`
}

type StudySessionSaveRes struct {
	Id int64 `json:"id"`
}

// StudySessionDeleteReq 删除学习记录（软删除）。
type StudySessionDeleteReq struct {
	g.Meta `path:"/study/session/delete" method:"post" tags:"学习" summary:"删除学习记录"`
	Id     int64 `json:"id"`
}

type StudySessionDeleteRes struct{}
