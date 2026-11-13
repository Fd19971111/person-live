package module

import "context"

// GetList 返回用户全部模块（含已隐藏），首次访问时按模块库初始化。
func GetList(ctx context.Context, userID int64) ([]Module, error) {
	if err := ensure(ctx, userID); err != nil {
		return nil, err
	}
	return list(ctx, userID)
}
