package v1

import "github.com/gogf/gf/v2/frame/g"

// HealthReq 健康检查请求。
type HealthReq struct {
	g.Meta `path:"/health" method:"get" tags:"系统" summary:"健康检查"`
}

// HealthRes 健康检查响应。
type HealthRes struct {
	Status  string `json:"status" dc:"服务状态"`
	Time    string `json:"time" dc:"服务器时间"`
	Version string `json:"version" dc:"服务版本"`
}
