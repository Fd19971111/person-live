package finance

import (
	"context"
	"time"

	"github.com/gogf/gf/v2/errors/gcode"
	"github.com/gogf/gf/v2/errors/gerror"
	"github.com/gogf/gf/v2/frame/g"
)

// cst 当前只服务国内用户，月份边界按东八区计算。
var cst = time.FixedZone("CST", 8*3600)

// Overview 记账总览。
type Overview struct {
	Month            string
	IncomeCents      int64
	ExpenseCents     int64
	BalanceCents     int64
	IncomeChangePct  float64
	ExpenseChangePct float64
	BalanceChangePct float64
	BalanceRate      float64
	TotalCount       int
	Trend            []TrendPoint
	Categories       []CategoryShare
	Recent           []TransactionItem
}

type TrendPoint struct {
	Month        string
	Label        string
	IncomeCents  int64
	ExpenseCents int64
}

type CategoryShare struct {
	Name        string
	Color       string
	AmountCents int64
	Percent     float64
}

type TransactionItem struct {
	ID          int64
	Date        string
	Title       string
	Category    string
	Type        int
	AmountCents int64
}

func monthLabel(month time.Month) string {
	labels := [...]string{"一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"}
	return labels[int(month)-1]
}

// GetOverview 汇总指定月份的记账数据，trend 固定返回最近六个月。
func GetOverview(ctx context.Context, userID int64, month string) (*Overview, error) {
	now := time.Now().In(cst)
	start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, cst)
	if month != "" {
		parsed, err := time.ParseInLocation("2006-01", month, cst)
		if err != nil {
			return nil, gerror.NewCode(gcode.CodeInvalidParameter, "月份格式应为 YYYY-MM")
		}
		start = parsed
	}
	end := start.AddDate(0, 1, 0)

	current, err := sumRange(ctx, userID, start, end)
	if err != nil {
		return nil, err
	}
	previous, err := sumRange(ctx, userID, start.AddDate(0, -1, 0), start)
	if err != nil {
		return nil, err
	}

	overview := &Overview{
		Month:        start.Format("2006-01"),
		IncomeCents:  current.Income,
		ExpenseCents: current.Expense,
		BalanceCents: current.Income - current.Expense,
		TotalCount:   int(current.Total),
	}
	overview.IncomeChangePct = percentChange(current.Income, previous.Income)
	overview.ExpenseChangePct = percentChange(current.Expense, previous.Expense)
	overview.BalanceChangePct = percentChange(current.Income-current.Expense, previous.Income-previous.Expense)
	if current.Income > 0 {
		overview.BalanceRate = round1(float64(overview.BalanceCents) / float64(current.Income) * 100)
	}

	for i := 5; i >= 0; i-- {
		from := start.AddDate(0, -i, 0)
		sum, err := sumRange(ctx, userID, from, from.AddDate(0, 1, 0))
		if err != nil {
			return nil, err
		}
		overview.Trend = append(overview.Trend, TrendPoint{
			Month:        from.Format("2006-01"),
			Label:        monthLabel(from.Month()),
			IncomeCents:  sum.Income,
			ExpenseCents: sum.Expense,
		})
	}

	categories, err := categoryShares(ctx, userID, start, end)
	if err != nil {
		return nil, err
	}
	overview.Categories = categories

	recent, err := recentTransactions(ctx, userID)
	if err != nil {
		return nil, err
	}
	overview.Recent = recent

	return overview, nil
}

type sums struct {
	Income  int64 `orm:"income"`
	Expense int64 `orm:"expense"`
	Total   int64 `orm:"total"`
}

func sumRange(ctx context.Context, userID int64, start, end time.Time) (sums, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT
			COALESCE(SUM(IF(type = 1, amount_cents, 0)), 0) AS income,
			COALESCE(SUM(IF(type = 2, amount_cents, 0)), 0) AS expense,
			COUNT(*) AS total
		FROM finance_transaction
		WHERE user_id = ? AND deleted_at IS NULL AND occurred_at >= ? AND occurred_at < ?`,
		userID, start, end,
	)
	if err != nil {
		return sums{}, err
	}
	var list []sums
	if err = rows.Structs(&list); err != nil {
		return sums{}, err
	}
	if len(list) == 0 {
		return sums{}, nil
	}
	return list[0], nil
}

func categoryShares(ctx context.Context, userID int64, start, end time.Time) ([]CategoryShare, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT c.name AS name, c.color AS color, SUM(t.amount_cents) AS amount
		FROM finance_transaction t
		JOIN finance_category c ON c.id = t.category_id
		WHERE t.user_id = ? AND t.type = 2 AND t.deleted_at IS NULL
			AND t.occurred_at >= ? AND t.occurred_at < ?
		GROUP BY c.id, c.name, c.color
		ORDER BY amount DESC`,
		userID, start, end,
	)
	if err != nil {
		return nil, err
	}

	var list []struct {
		Name   string `orm:"name"`
		Color  string `orm:"color"`
		Amount int64  `orm:"amount"`
	}
	if err = rows.Structs(&list); err != nil {
		return nil, err
	}

	var total int64
	for _, row := range list {
		total += row.Amount
	}

	shares := make([]CategoryShare, 0, len(list))
	for _, row := range list {
		percent := 0.0
		if total > 0 {
			percent = round1(float64(row.Amount) / float64(total) * 100)
		}
		shares = append(shares, CategoryShare{
			Name:        row.Name,
			Color:       row.Color,
			AmountCents: row.Amount,
			Percent:     percent,
		})
	}
	return shares, nil
}

func recentTransactions(ctx context.Context, userID int64) ([]TransactionItem, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT
			t.id AS id,
			t.title AS title,
			t.amount_cents AS amount,
			t.type AS type,
			COALESCE(c.name, '未分类') AS category,
			DATE_FORMAT(DATE_ADD(t.occurred_at, INTERVAL 8 HOUR), '%e %b') AS day
		FROM finance_transaction t
		LEFT JOIN finance_category c ON c.id = t.category_id
		WHERE t.user_id = ? AND t.deleted_at IS NULL
		ORDER BY t.occurred_at DESC, t.id DESC
		LIMIT 5`,
		userID,
	)
	if err != nil {
		return nil, err
	}

	var list []struct {
		ID       int64  `orm:"id"`
		Title    string `orm:"title"`
		Amount   int64  `orm:"amount"`
		Type     int    `orm:"type"`
		Category string `orm:"category"`
		Day      string `orm:"day"`
	}
	if err = rows.Structs(&list); err != nil {
		return nil, err
	}

	items := make([]TransactionItem, 0, len(list))
	for _, row := range list {
		items = append(items, TransactionItem{
			ID:          row.ID,
			Date:        row.Day,
			Title:       row.Title,
			Category:    row.Category,
			Type:        row.Type,
			AmountCents: row.Amount,
		})
	}
	return items, nil
}

func percentChange(current, previous int64) float64 {
	if previous == 0 {
		return 0
	}
	return round1(float64(current-previous) / float64(previous) * 100)
}

func round1(value float64) float64 {
	return float64(int64(value*10+0.5)) / 10
}
