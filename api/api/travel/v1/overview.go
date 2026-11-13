package v1

import "github.com/gogf/gf/v2/frame/g"

// TravelTripItem 一条旅行足迹。
type TravelTripItem struct {
	Id        int64  `json:"id"`
	Title     string `json:"title"`
	Region    string `json:"region"`
	VisitedOn string `json:"visitedOn"`
	Date      string `json:"date"`
	Year      int    `json:"year"`
	Days      int    `json:"days"`
	Rating    int    `json:"rating"`
	Note      string `json:"note"`
	Color     string `json:"color"`
}

// TravelOverviewReq 旅行足迹总览。
type TravelOverviewReq struct {
	g.Meta `path:"/travel/overview" method:"get" tags:"旅行" summary:"旅行足迹总览"`
}

// TravelOverviewRes 旅行页所需的全部数据。
type TravelOverviewRes struct {
	Total      int               `json:"total"`
	PlaceCount int               `json:"placeCount"`
	TotalDays  int               `json:"totalDays"`
	YearCount  int               `json:"yearCount"`
	Year       int               `json:"year"`
	AvgRating  float64           `json:"avgRating"`
	Items      []TravelTripItem  `json:"items"`
}
