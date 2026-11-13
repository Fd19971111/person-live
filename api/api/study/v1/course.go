package v1

import "github.com/gogf/gf/v2/frame/g"

// StudyCoursesReq 课程列表。
type StudyCoursesReq struct {
	g.Meta `path:"/study/courses" method:"get" tags:"学习" summary:"学习课程列表"`
}

type StudyCoursesRes struct {
	Items []StudyCourseItem `json:"items"`
}

// StudyCourseSaveReq 新增或编辑课程，Id 为 0 时表示新增。
type StudyCourseSaveReq struct {
	g.Meta     `path:"/study/course/save" method:"post" tags:"学习" summary:"保存学习课程"`
	Id         int64  `json:"id"`
	Title      string `json:"title"`
	UnitLabel  string `json:"unitLabel" dc:"进度单位，默认「章」"`
	TotalUnits int    `json:"totalUnits"`
	DoneUnits  int    `json:"doneUnits"`
	Color      string `json:"color"`
	SortOrder  int    `json:"sortOrder"`
}

type StudyCourseSaveRes struct {
	Id int64 `json:"id"`
}

// StudyCourseDeleteReq 删除课程（软删除）。
type StudyCourseDeleteReq struct {
	g.Meta `path:"/study/course/delete" method:"post" tags:"学习" summary:"删除学习课程"`
	Id     int64 `json:"id"`
}

type StudyCourseDeleteRes struct{}
