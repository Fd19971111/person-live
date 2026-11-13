package health

import (
	"context"
	"time"

	v1 "study/api/api/health/v1"
)

// ControllerV1 健康检查控制器。
type ControllerV1 struct{}

// NewV1 创建健康检查控制器。
func NewV1() *ControllerV1 {
	return &ControllerV1{}
}

// Health 返回服务运行状态。
func (c *ControllerV1) Health(ctx context.Context, req *v1.HealthReq) (res *v1.HealthRes, err error) {
	return &v1.HealthRes{
		Status:  "ok",
		Time:    time.Now().Format(time.RFC3339),
		Version: "0.1.0",
	}, nil
}
