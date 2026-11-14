package user

import (
	"context"
	"fmt"
	"strconv"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/user/v1"
	"study/api/internal/consts"
	"study/api/internal/logic/backup"
)

// Export 以 ZIP 形式下载当前账号的全部数据。
// 这里直接写二进制响应体，统一 JSON 包装中间件检测到已有缓冲内容后会跳过。
func (c *ControllerV1) Export(ctx context.Context, req *v1.ExportReq) (res *v1.ExportRes, err error) {
	request := g.RequestFromCtx(ctx)
	data, name, err := backup.Build(ctx, request.GetCtxVar(consts.CtxKeyUserId).Int64())
	if err != nil {
		return nil, err
	}

	header := request.Response.Header()
	header.Set("Content-Type", "application/zip")
	header.Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, name))
	header.Set("Content-Length", strconv.Itoa(len(data)))
	header.Set("Cache-Control", "no-store")
	request.Response.Write(data)
	return nil, nil
}
