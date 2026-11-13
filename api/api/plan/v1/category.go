package v1

import "github.com/gogf/gf/v2/frame/g"

// PlanCategoryItem 计划分类。
type PlanCategoryItem struct {
	Id        int64  `json:"id"`
	Name      string `json:"name"`
	Color     string `json:"color"`
	SortOrder int    `json:"sortOrder"`
	TaskCount int    `json:"taskCount"`
}

// PlanCategoriesReq 计划分类列表。
type PlanCategoriesReq struct {
	g.Meta `path:"/plan/categories" method:"get" tags:"计划" summary:"计划分类列表"`
}

type PlanCategoriesRes struct {
	Items []PlanCategoryItem `json:"items"`
}

// PlanCategorySaveReq 新增或编辑计划分类，Id 为 0 时表示新增。
type PlanCategorySaveReq struct {
	g.Meta    `path:"/plan/category/save" method:"post" tags:"计划" summary:"保存计划分类"`
	Id        int64  `json:"id"`
	Name      string `json:"name"`
	Color     string `json:"color"`
	SortOrder int    `json:"sortOrder"`
}

type PlanCategorySaveRes struct {
	Id int64 `json:"id"`
}

// PlanCategoryDeleteReq 删除计划分类，仅做软删除（隐藏）。
type PlanCategoryDeleteReq struct {
	g.Meta `path:"/plan/category/delete" method:"post" tags:"计划" summary:"删除计划分类"`
	Id     int64 `json:"id"`
}

type PlanCategoryDeleteRes struct{}
