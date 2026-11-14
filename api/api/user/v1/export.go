package v1

import "github.com/gogf/gf/v2/frame/g"

// ExportReq 导出当前账号的全部数据。
type ExportReq struct {
	g.Meta `path:"/user/export" method:"get" tags:"用户" summary:"导出全部数据"`
}

// ExportRes 响应体是 ZIP 二进制，由控制器直接写入，此结构仅用于路由注册。
type ExportRes struct{}
