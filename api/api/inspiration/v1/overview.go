package v1

import "github.com/gogf/gf/v2/frame/g"

// InspirationItem 一条灵感收藏。
type InspirationItem struct {
	Id      int64  `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
	Tag     string `json:"tag"`
	Source  string `json:"source"`
	Color   string `json:"color"`
	Pinned  bool   `json:"pinned"`
	Date    string `json:"date"`
}

// InspirationTag 标签及其灵感数量。
type InspirationTag struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

// InspirationOverviewReq 灵感总览。
type InspirationOverviewReq struct {
	g.Meta `path:"/inspiration/overview" method:"get" tags:"灵感" summary:"灵感总览"`
}

// InspirationOverviewRes 灵感页所需的全部数据。
type InspirationOverviewRes struct {
	Total       int               `json:"total"`
	MonthAdded  int               `json:"monthAdded"`
	PinnedCount int               `json:"pinnedCount"`
	TagTotal    int               `json:"tagTotal"`
	Tags        []InspirationTag  `json:"tags"`
	Items       []InspirationItem `json:"items"`
}
