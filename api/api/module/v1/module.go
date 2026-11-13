package v1

import "github.com/gogf/gf/v2/frame/g"

// ModuleItem 用户空间里的一个模块，Hidden 为真表示已删除（隐藏）。
type ModuleItem struct {
	Key       string `json:"key"`
	Name      string `json:"name"`
	Icon      string `json:"icon"`
	Color     string `json:"color"`
	Template  string `json:"template"`
	SortOrder int    `json:"sortOrder"`
	Hidden    bool   `json:"hidden"`
}

// ModuleListReq 模块列表，包含已隐藏的模块，供「添加模块」时加回。
type ModuleListReq struct {
	g.Meta `path:"/module/list" method:"get" tags:"模块" summary:"模块列表"`
}

type ModuleListRes struct {
	Items []ModuleItem `json:"items"`
}

// ModuleAddReq 添加模块或加回已隐藏的模块。
type ModuleAddReq struct {
	g.Meta   `path:"/module/add" method:"post" tags:"模块" summary:"添加模块"`
	Key      string `json:"key"`
	Name     string `json:"name"`
	Icon     string `json:"icon"`
	Color    string `json:"color"`
	Template string `json:"template"`
}

type ModuleAddRes struct {
	Items []ModuleItem `json:"items"`
}

// ModuleHideReq 删除模块，仅做隐藏，之后可从「添加模块」中加回。
type ModuleHideReq struct {
	g.Meta `path:"/module/hide" method:"post" tags:"模块" summary:"隐藏模块"`
	Key    string `json:"key"`
}

type ModuleHideRes struct {
	Items []ModuleItem `json:"items"`
}

// ModuleSortReq 按给定顺序重排侧边栏模块。
type ModuleSortReq struct {
	g.Meta `path:"/module/sort" method:"post" tags:"模块" summary:"模块排序"`
	Keys   []string `json:"keys"`
}

type ModuleSortRes struct {
	Items []ModuleItem `json:"items"`
}
