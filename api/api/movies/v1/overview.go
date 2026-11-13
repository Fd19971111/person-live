package v1

import "github.com/gogf/gf/v2/frame/g"

// MovieItem 一条电影记录。
type MovieItem struct {
	Id         int64   `json:"id"`
	Title      string  `json:"title"`
	Year       int     `json:"year"`
	Genre      string  `json:"genre"`
	Director   string  `json:"director"`
	Rating     float64 `json:"rating"`
	Status     int     `json:"status"`
	StatusName string  `json:"statusName"`
	Note       string  `json:"note"`
	Color      string  `json:"color"`
	Date       string  `json:"date"`
}

// MovieStatusCount 某个状态下的片单数量。
type MovieStatusCount struct {
	Status int    `json:"status"`
	Name   string `json:"name"`
	Count  int    `json:"count"`
}

// MoviesOverviewReq 电影清单总览。
type MoviesOverviewReq struct {
	g.Meta `path:"/movies/overview" method:"get" tags:"电影" summary:"电影清单总览"`
}

// MoviesOverviewRes 电影页所需的全部数据。
type MoviesOverviewRes struct {
	Total         int                `json:"total"`
	WantCount     int                `json:"wantCount"`
	WatchingCount int                `json:"watchingCount"`
	WatchedCount  int                `json:"watchedCount"`
	AvgRating     float64            `json:"avgRating"`
	Statuses      []MovieStatusCount `json:"statuses"`
	Items         []MovieItem        `json:"items"`
}
