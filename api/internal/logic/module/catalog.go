package module

import (
	"context"
	"fmt"

	"github.com/gogf/gf/v2/errors/gcode"
	"github.com/gogf/gf/v2/errors/gerror"
	"github.com/gogf/gf/v2/frame/g"
)

// DefaultColor 模块缺省颜色。
const DefaultColor = "#6C9E8D"

// Entry 模块库中的可选模块。
type Entry struct {
	Key      string
	Name     string
	Icon     string
	Color    string
	Template string
	// Default 为真表示新用户默认显示在侧边栏。
	Default bool
}

// Module 用户已拥有的模块。
type Module struct {
	Key       string
	Name      string
	Icon      string
	Color     string
	Template  string
	SortOrder int
	Hidden    bool
}

// Catalog 模块库，顺序即默认排序。
var Catalog = []Entry{
	{Key: "finance", Name: "记账", Icon: "wallet", Color: "#E56F4A", Template: "Chart", Default: true},
	{Key: "music", Name: "音乐", Icon: "music", Color: "#9B72D2", Template: "List", Default: true},
	{Key: "plans", Name: "计划", Icon: "check", Color: "#4C8D78", Template: "CardFlow", Default: true},
	{Key: "learning", Name: "学习", Icon: "book", Color: "#5F6E9C", Template: "Chart", Default: true},
	{Key: "movies", Name: "电影清单", Icon: "film", Color: "#6389A8", Template: "CardFlow"},
	{Key: "travel", Name: "旅行足迹", Icon: "map", Color: "#B87758", Template: "Timeline"},
	{Key: "fitness", Name: "运动记录", Icon: "activity", Color: "#5C927A", Template: "Chart"},
	{Key: "inspiration", Name: "灵感收藏", Icon: "bulb", Color: "#9B72D2", Template: "List"},
	{Key: "album", Name: "相册", Icon: "image", Color: "#5F8C93", Template: "CardFlow"},
}

func lookup(key string) (Entry, bool) {
	for _, entry := range Catalog {
		if entry.Key == key {
			return entry, true
		}
	}
	return Entry{}, false
}

func invalid(format string, args ...any) error {
	return gerror.NewCode(gcode.CodeInvalidParameter, fmt.Sprintf(format, args...))
}

// ensure 补齐模块库中新增的模块，已隐藏的模块保持隐藏。
func ensure(ctx context.Context, userID int64) error {
	rows, err := g.DB().GetAll(ctx, "SELECT module_key FROM user_module WHERE user_id = ?", userID)
	if err != nil {
		return err
	}
	existing := make(map[string]bool, len(rows))
	for _, row := range rows {
		existing[row["module_key"].String()] = true
	}
	firstTime := len(existing) == 0

	for index, entry := range Catalog {
		if existing[entry.Key] {
			continue
		}
		hidden := 1
		if firstTime && entry.Default {
			hidden = 0
		}
		if _, err = g.DB().Exec(ctx, `
			INSERT IGNORE INTO user_module
				(user_id, module_key, name, icon, color, template, sort_order, hidden)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			userID, entry.Key, entry.Name, entry.Icon, entry.Color, entry.Template, index, hidden); err != nil {
			return err
		}
	}
	return nil
}

// list 读取用户模块，按排序值升序。
func list(ctx context.Context, userID int64) ([]Module, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT module_key, name, icon, color, template, sort_order, hidden
		FROM user_module WHERE user_id = ?
		ORDER BY sort_order, id`, userID)
	if err != nil {
		return nil, err
	}
	modules := make([]Module, 0, len(rows))
	for _, row := range rows {
		modules = append(modules, Module{
			Key:       row["module_key"].String(),
			Name:      row["name"].String(),
			Icon:      row["icon"].String(),
			Color:     row["color"].String(),
			Template:  row["template"].String(),
			SortOrder: row["sort_order"].Int(),
			Hidden:    row["hidden"].Int() == 1,
		})
	}
	return modules, nil
}
