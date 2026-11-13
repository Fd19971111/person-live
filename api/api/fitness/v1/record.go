package v1

import "github.com/gogf/gf/v2/frame/g"

// FitnessRecordSaveReq 新增或编辑运动记录，Id 为 0 时表示新增。
type FitnessRecordSaveReq struct {
	g.Meta      `path:"/fitness/record/save" method:"post" tags:"运动" summary:"保存运动记录"`
	Id          int64   `json:"id"`
	Activity    string  `json:"activity"`
	Minutes     int     `json:"minutes"`
	DistanceKm  float64 `json:"distanceKm" dc:"距离，跑步 / 骑行时填写"`
	Calories    int     `json:"calories"`
	PerformedOn string  `json:"performedOn" dc:"运动日期，YYYY-MM-DD"`
	Note        string  `json:"note"`
	Color       string  `json:"color"`
}

type FitnessRecordSaveRes struct {
	Id int64 `json:"id"`
}

// FitnessRecordDeleteReq 删除运动记录（软删除）。
type FitnessRecordDeleteReq struct {
	g.Meta `path:"/fitness/record/delete" method:"post" tags:"运动" summary:"删除运动记录"`
	Id     int64 `json:"id"`
}

type FitnessRecordDeleteRes struct{}
