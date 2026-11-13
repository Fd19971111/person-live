package v1

import "github.com/gogf/gf/v2/frame/g"

// TravelTripSaveReq 新增或编辑旅行足迹，Id 为 0 时表示新增。
type TravelTripSaveReq struct {
	g.Meta    `path:"/travel/trip/save" method:"post" tags:"旅行" summary:"保存旅行足迹"`
	Id        int64  `json:"id"`
	Title     string `json:"title"`
	Region    string `json:"region"`
	VisitedOn string `json:"visitedOn" dc:"出发日期，YYYY-MM-DD"`
	Days      int    `json:"days"`
	Rating    int    `json:"rating" dc:"1-5 星，0 表示未评分"`
	Note      string `json:"note"`
	Color     string `json:"color"`
}

type TravelTripSaveRes struct {
	Id int64 `json:"id"`
}

// TravelTripDeleteReq 删除旅行足迹（软删除）。
type TravelTripDeleteReq struct {
	g.Meta `path:"/travel/trip/delete" method:"post" tags:"旅行" summary:"删除旅行足迹"`
	Id     int64 `json:"id"`
}

type TravelTripDeleteRes struct{}
