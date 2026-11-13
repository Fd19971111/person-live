package v1

import "github.com/gogf/gf/v2/frame/g"

// StudyGoalSaveReq 保存每周学习目标。
type StudyGoalSaveReq struct {
	g.Meta            `path:"/study/goal/save" method:"post" tags:"学习" summary:"保存每周学习目标"`
	WeeklyGoalMinutes int `json:"weeklyGoalMinutes" dc:"每周目标分钟数"`
}

type StudyGoalSaveRes struct {
	WeeklyGoalMinutes int `json:"weeklyGoalMinutes"`
}

// StudyGoalReq 读取每周学习目标。
type StudyGoalReq struct {
	g.Meta `path:"/study/goal" method:"get" tags:"学习" summary:"读取每周学习目标"`
}

type StudyGoalRes struct {
	WeeklyGoalMinutes int `json:"weeklyGoalMinutes"`
}
