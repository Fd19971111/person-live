package v1

import "github.com/gogf/gf/v2/frame/g"

// OverviewReq 记账总览。
type OverviewReq struct {
	g.Meta `path:"/finance/overview" method:"get" tags:"记账" summary:"记账总览"`
	Month  string `json:"month" in:"query" dc:"月份 YYYY-MM，默认当月"`
}

// TrendPoint 单月收支。
type TrendPoint struct {
	Month        string `json:"month"`
	Label        string `json:"label"`
	IncomeCents  int64  `json:"incomeCents"`
	ExpenseCents int64  `json:"expenseCents"`
}

// CategoryShare 支出分类占比。
type CategoryShare struct {
	Name        string  `json:"name"`
	Color       string  `json:"color"`
	AmountCents int64   `json:"amountCents"`
	Percent     float64 `json:"percent"`
}

// TransactionItem 一笔流水。
type TransactionItem struct {
	ID          int64  `json:"id"`
	Date        string `json:"date"`
	Title       string `json:"title"`
	Category    string `json:"category"`
	Type        int    `json:"type"`
	AmountCents int64  `json:"amountCents"`
}

// OverviewRes 记账页所需的全部数据。
type OverviewRes struct {
	Month           string            `json:"month"`
	IncomeCents     int64             `json:"incomeCents"`
	ExpenseCents    int64             `json:"expenseCents"`
	BalanceCents    int64             `json:"balanceCents"`
	IncomeChangePct  float64           `json:"incomeChangePct"`
	ExpenseChangePct float64           `json:"expenseChangePct"`
	BalanceChangePct float64           `json:"balanceChangePct"`
	BalanceRate      float64           `json:"balanceRate"`
	TotalCount       int               `json:"totalCount"`
	Trend            []TrendPoint      `json:"trend"`
	Categories       []CategoryShare   `json:"categories"`
	Recent           []TransactionItem `json:"recent"`
}
