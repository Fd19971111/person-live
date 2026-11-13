package v1

import "github.com/gogf/gf/v2/frame/g"

// CategoryItem 记账分类。
type CategoryItem struct {
	Id               int64  `json:"id"`
	Name             string `json:"name"`
	Kind             int    `json:"kind"`
	Color            string `json:"color"`
	SortOrder        int    `json:"sortOrder"`
	TransactionCount int    `json:"transactionCount"`
}

// CategoriesReq 分类列表。
type CategoriesReq struct {
	g.Meta `path:"/finance/categories" method:"get" tags:"记账" summary:"记账分类列表"`
}

type CategoriesRes struct {
	Items []CategoryItem `json:"items"`
}

// CategorySaveReq 新增或编辑分类，Id 为 0 时表示新增。
type CategorySaveReq struct {
	g.Meta    `path:"/finance/category/save" method:"post" tags:"记账" summary:"保存记账分类"`
	Id        int64  `json:"id"`
	Name      string `json:"name"`
	Kind      int    `json:"kind"`
	Color     string `json:"color"`
	SortOrder int    `json:"sortOrder"`
}

type CategorySaveRes struct {
	Id int64 `json:"id"`
}

// CategoryDeleteReq 删除分类。
type CategoryDeleteReq struct {
	g.Meta `path:"/finance/category/delete" method:"post" tags:"记账" summary:"删除记账分类"`
	Id     int64 `json:"id"`
}

type CategoryDeleteRes struct{}

// TransactionRow 流水列表中的一行。
type TransactionRow struct {
	Id          int64  `json:"id"`
	Date        string `json:"date"`
	Title       string `json:"title"`
	Category    string `json:"category"`
	CategoryId  int64  `json:"categoryId"`
	Type        int    `json:"type"`
	AmountCents int64  `json:"amountCents"`
	Note        string `json:"note"`
}

// TransactionsReq 流水列表，支持月份、类型、分类、关键字筛选与分页。
type TransactionsReq struct {
	g.Meta     `path:"/finance/transactions" method:"get" tags:"记账" summary:"记账流水列表"`
	Month      string `json:"month"      in:"query" dc:"月份 YYYY-MM，空表示全部"`
	Type       int    `json:"type"       in:"query" dc:"0 全部 1 收入 2 支出"`
	CategoryId int64  `json:"categoryId" in:"query" dc:"0 全部"`
	Keyword    string `json:"keyword"    in:"query"`
	Page       int    `json:"page"       in:"query"`
	PageSize   int    `json:"pageSize"   in:"query"`
}

type TransactionsRes struct {
	Items        []TransactionRow `json:"items"`
	Total        int              `json:"total"`
	Page         int              `json:"page"`
	PageSize     int              `json:"pageSize"`
	IncomeCents  int64            `json:"incomeCents"`
	ExpenseCents int64            `json:"expenseCents"`
}

// TransactionSaveReq 新增或编辑流水，Id 为 0 时表示新增。金额单位为分。
type TransactionSaveReq struct {
	g.Meta      `path:"/finance/transaction/save" method:"post" tags:"记账" summary:"保存记账流水"`
	Id          int64  `json:"id"`
	Type        int    `json:"type"`
	CategoryId  int64  `json:"categoryId"`
	AmountCents int64  `json:"amountCents"`
	Title        string `json:"title"`
	Note         string `json:"note"`
	Date         string `json:"date"`
	CategoryName string `json:"categoryName" dc:"分类名称，可自由输入；不存在时自动创建"`
}

type TransactionSaveRes struct {
	Id int64 `json:"id"`
}

// TransactionDeleteReq 删除流水（软删除）。
type TransactionDeleteReq struct {
	g.Meta `path:"/finance/transaction/delete" method:"post" tags:"记账" summary:"删除记账流水"`
	Id     int64 `json:"id"`
}

type TransactionDeleteRes struct{}
