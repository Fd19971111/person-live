package finance

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/gogf/gf/v2/errors/gcode"
	"github.com/gogf/gf/v2/errors/gerror"
	"github.com/gogf/gf/v2/frame/g"
)

const defaultCategoryColor = "#B89CD5"

var colorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

// Category 记账分类及其关联的流水数量。
type Category struct {
	ID               int64
	Name             string
	Kind             int
	Color            string
	SortOrder        int
	TransactionCount int
}

// TransactionRow 流水列表行。
type TransactionRow struct {
	ID          int64
	Date        string
	Title       string
	Category    string
	CategoryID  int64
	Type        int
	AmountCents int64
	Note        string
}

// TransactionQuery 流水筛选条件，All 为真时不分页（用于导出）。
type TransactionQuery struct {
	Month      string
	Type       int
	CategoryID int64
	Keyword    string
	Page       int
	PageSize   int
	All        bool
}

func invalid(format string, args ...any) error {
	return gerror.NewCode(gcode.CodeInvalidParameter, fmt.Sprintf(format, args...))
}

func countSQL(ctx context.Context, query string, args ...any) (int, error) {
	value, err := g.DB().GetValue(ctx, query, args...)
	if err != nil {
		return 0, err
	}
	return value.Int(), nil
}

// ListCategories 返回当前用户的分类，按收入/支出与排序分组。
func ListCategories(ctx context.Context, userID int64) ([]Category, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT c.id AS id, c.name AS name, c.kind AS kind, c.color AS color,
		       c.sort_order AS sort_order,
		       (SELECT COUNT(*) FROM finance_transaction t
		          WHERE t.category_id = c.id AND t.deleted_at IS NULL) AS tx_count
		FROM finance_category c
		WHERE c.user_id = ?
		ORDER BY c.kind, c.sort_order, c.id`, userID)
	if err != nil {
		return nil, err
	}
	var list []struct {
		ID    int64  `orm:"id"`
		Name  string `orm:"name"`
		Kind  int    `orm:"kind"`
		Color string `orm:"color"`
		Sort  int    `orm:"sort_order"`
		Count int    `orm:"tx_count"`
	}
	if err = rows.Structs(&list); err != nil {
		return nil, err
	}
	categories := make([]Category, 0, len(list))
	for _, item := range list {
		categories = append(categories, Category{
			ID: item.ID, Name: item.Name, Kind: item.Kind, Color: item.Color,
			SortOrder: item.Sort, TransactionCount: item.Count,
		})
	}
	return categories, nil
}

// SaveCategory 新增或编辑分类，同名同类型不允许重复。
func SaveCategory(ctx context.Context, userID, id int64, name string, kind int, color string, sortOrder int) (int64, error) {
	name = strings.TrimSpace(name)
	if utf8.RuneCountInString(name) == 0 || utf8.RuneCountInString(name) > 32 {
		return 0, invalid("分类名称需为 1-32 个字符")
	}
	if kind != 1 && kind != 2 {
		return 0, invalid("分类类型不正确")
	}
	color = strings.TrimSpace(color)
	if color == "" {
		color = defaultCategoryColor
	}
	if !colorPattern.MatchString(color) {
		return 0, invalid("颜色需为 #RRGGBB 格式")
	}
	count, err := countSQL(ctx,
		"SELECT COUNT(*) FROM finance_category WHERE user_id = ? AND name = ? AND kind = ? AND id <> ?",
		userID, name, kind, id)
	if err != nil {
		return 0, err
	}
	if count > 0 {
		return 0, invalid("已存在同名分类「%s」", name)
	}
	if sortOrder < 0 {
		sortOrder = 0
	}

	if id == 0 {
		result, err := g.DB().Exec(ctx, `
			INSERT INTO finance_category (user_id, name, kind, color, sort_order)
			VALUES (?, ?, ?, ?, ?)`, userID, name, kind, color, sortOrder)
		if err != nil {
			return 0, err
		}
		return result.LastInsertId()
	}
	owned, err := countSQL(ctx, "SELECT COUNT(*) FROM finance_category WHERE id = ? AND user_id = ?", id, userID)
	if err != nil {
		return 0, err
	}
	if owned == 0 {
		return 0, invalid("分类不存在")
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE finance_category SET name = ?, kind = ?, color = ?, sort_order = ?
		WHERE id = ? AND user_id = ?`, name, kind, color, sortOrder, id, userID)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// DeleteCategory 删除分类，仍被流水引用时拒绝删除。
func DeleteCategory(ctx context.Context, userID, id int64) error {
	owned, err := countSQL(ctx, "SELECT COUNT(*) FROM finance_category WHERE id = ? AND user_id = ?", id, userID)
	if err != nil {
		return err
	}
	if owned == 0 {
		return invalid("分类不存在")
	}
	used, err := countSQL(ctx, `
		SELECT COUNT(*) FROM finance_transaction
		WHERE category_id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	if used > 0 {
		return invalid("该分类下还有 %d 笔流水，请先把流水移到其它分类", used)
	}
	_, err = g.DB().Exec(ctx, "DELETE FROM finance_category WHERE id = ? AND user_id = ?", id, userID)
	return err
}

func monthRange(month string) (time.Time, time.Time, error) {
	start, err := time.ParseInLocation("2006-01", month, cst)
	if err != nil {
		return time.Time{}, time.Time{}, invalid("月份格式应为 YYYY-MM")
	}
	return start, start.AddDate(0, 1, 0), nil
}

func parseDay(value string) (time.Time, error) {
	value = strings.TrimSpace(value)
	value = strings.ReplaceAll(strings.ReplaceAll(value, "/", "-"), ".", "-")
	if len(value) > 10 {
		value = value[:10]
	}
	for _, layout := range []string{"2006-01-02", "2006-1-2"} {
		if parsed, err := time.ParseInLocation(layout, value, cst); err == nil {
			return time.Date(parsed.Year(), parsed.Month(), parsed.Day(), 12, 0, 0, 0, cst), nil
		}
	}
	return time.Time{}, invalid("日期格式应为 YYYY-MM-DD")
}

func nullableID(id int64) any {
	if id <= 0 {
		return nil
	}
	return id
}

func transactionWhere(userID int64, q TransactionQuery) (string, []any, error) {
	where := []string{"t.user_id = ?", "t.deleted_at IS NULL"}
	args := []any{userID}
	if q.Month != "" {
		start, end, err := monthRange(q.Month)
		if err != nil {
			return "", nil, err
		}
		where = append(where, "t.occurred_at >= ?", "t.occurred_at < ?")
		args = append(args, start, end)
	}
	if q.Type == 1 || q.Type == 2 {
		where = append(where, "t.type = ?")
		args = append(args, q.Type)
	}
	if q.CategoryID > 0 {
		where = append(where, "t.category_id = ?")
		args = append(args, q.CategoryID)
	}
	if keyword := strings.TrimSpace(q.Keyword); keyword != "" {
		like := "%" + keyword + "%"
		where = append(where, "(t.title LIKE ? OR t.note LIKE ? OR c.name LIKE ?)")
		args = append(args, like, like, like)
	}
	return strings.Join(where, " AND "), args, nil
}

// ListTransactions 按筛选条件返回流水、总数与筛选后的收支合计。
func ListTransactions(ctx context.Context, userID int64, q TransactionQuery) ([]TransactionRow, int, int64, int64, error) {
	where, args, err := transactionWhere(userID, q)
	if err != nil {
		return nil, 0, 0, 0, err
	}
	from := ` FROM finance_transaction t
		LEFT JOIN finance_category c ON c.id = t.category_id
		WHERE ` + where

	total, err := countSQL(ctx, "SELECT COUNT(*)"+from, args...)
	if err != nil {
		return nil, 0, 0, 0, err
	}
	sums, err := g.DB().GetAll(ctx, `
		SELECT COALESCE(SUM(IF(t.type = 1, t.amount_cents, 0)), 0) AS income,
		       COALESCE(SUM(IF(t.type = 2, t.amount_cents, 0)), 0) AS expense`+from, args...)
	if err != nil {
		return nil, 0, 0, 0, err
	}
	var sumList []struct {
		Income  int64 `orm:"income"`
		Expense int64 `orm:"expense"`
	}
	if err = sums.Structs(&sumList); err != nil {
		return nil, 0, 0, 0, err
	}
	var income, expense int64
	if len(sumList) > 0 {
		income, expense = sumList[0].Income, sumList[0].Expense
	}

	query := `
		SELECT t.id AS id, t.type AS type, t.amount_cents AS amount,
		       t.title AS title, t.note AS note,
		       COALESCE(c.name, '未分类') AS category,
		       COALESCE(t.category_id, 0) AS category_id,
		       DATE_FORMAT(DATE_ADD(t.occurred_at, INTERVAL 8 HOUR), '%Y-%m-%d') AS day` + from +
		` ORDER BY t.occurred_at DESC, t.id DESC`
	queryArgs := append([]any{}, args...)
	if !q.All {
		if q.Page < 1 {
			q.Page = 1
		}
		if q.PageSize < 1 || q.PageSize > 500 {
			q.PageSize = 20
		}
		query += " LIMIT ? OFFSET ?"
		queryArgs = append(queryArgs, q.PageSize, (q.Page-1)*q.PageSize)
	}
	rows, err := g.DB().GetAll(ctx, query, queryArgs...)
	if err != nil {
		return nil, 0, 0, 0, err
	}
	var list []struct {
		ID         int64  `orm:"id"`
		Type       int    `orm:"type"`
		Amount     int64  `orm:"amount"`
		Title      string `orm:"title"`
		Note       string `orm:"note"`
		Category   string `orm:"category"`
		CategoryID int64  `orm:"category_id"`
		Day        string `orm:"day"`
	}
	if err = rows.Structs(&list); err != nil {
		return nil, 0, 0, 0, err
	}
	items := make([]TransactionRow, 0, len(list))
	for _, item := range list {
		items = append(items, TransactionRow{
			ID: item.ID, Date: item.Day, Title: item.Title, Category: item.Category,
			CategoryID: item.CategoryID, Type: item.Type, AmountCents: item.Amount, Note: item.Note,
		})
	}
	return items, total, income, expense, nil
}

// resolveCategory 按名称查找分类，找不到时自动创建，返回分类 ID。
func resolveCategory(ctx context.Context, userID int64, name string, kind int) (int64, error) {
	name = strings.TrimSpace(name)
	if utf8.RuneCountInString(name) > 32 {
		return 0, invalid("分类名称不能超过 32 个字符")
	}
	value, err := g.DB().GetValue(ctx, `
		SELECT id FROM finance_category
		WHERE user_id = ? AND name = ? AND kind = ? LIMIT 1`, userID, name, kind)
	if err != nil {
		return 0, err
	}
	if id := value.Int64(); id > 0 {
		return id, nil
	}
	count, err := countSQL(ctx, "SELECT COUNT(*) FROM finance_category WHERE user_id = ?", userID)
	if err != nil {
		return 0, err
	}
	result, err := g.DB().Exec(ctx, `
		INSERT INTO finance_category (user_id, name, kind, color, sort_order)
		VALUES (?, ?, ?, ?, ?)`, userID, name, kind, defaultCategoryColor, count)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

// SaveTransaction 新增或编辑流水，金额恒为正数、单位为分。
// categoryName 允许自由输入，不存在时自动创建分类；为空且未指定 categoryID 时记为未分类。
func SaveTransaction(ctx context.Context, userID, id int64, txType int, categoryID, amountCents int64,
	title, note, date, categoryName string) (int64, error) {
	title = strings.TrimSpace(title)
	note = strings.TrimSpace(note)
	if utf8.RuneCountInString(title) == 0 || utf8.RuneCountInString(title) > 64 {
		return 0, invalid("标题需为 1-64 个字符")
	}
	if utf8.RuneCountInString(note) > 255 {
		return 0, invalid("备注不能超过 255 个字符")
	}
	if txType != 1 && txType != 2 {
		return 0, invalid("收支类型不正确")
	}
	if amountCents <= 0 {
		return 0, invalid("金额必须大于 0")
	}
	occurredAt, err := parseDay(date)
	if err != nil {
		return 0, err
	}
	if name := strings.TrimSpace(categoryName); name != "" {
		resolved, err := resolveCategory(ctx, userID, name, txType)
		if err != nil {
			return 0, err
		}
		categoryID = resolved
	} else if categoryID > 0 {
		owned, err := countSQL(ctx,
			"SELECT COUNT(*) FROM finance_category WHERE id = ? AND user_id = ?", categoryID, userID)
		if err != nil {
			return 0, err
		}
		if owned == 0 {
			return 0, invalid("所选分类不存在")
		}
	} else {
		categoryID = 0
	}

	if id == 0 {
		result, err := g.DB().Exec(ctx, `
			INSERT INTO finance_transaction
				(user_id, category_id, type, amount_cents, title, note, occurred_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)`,
			userID, nullableID(categoryID), txType, amountCents, title, note, occurredAt)
		if err != nil {
			return 0, err
		}
		return result.LastInsertId()
	}
	owned, err := countSQL(ctx, `
		SELECT COUNT(*) FROM finance_transaction
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return 0, err
	}
	if owned == 0 {
		return 0, invalid("流水不存在或已被删除")
	}
	_, err = g.DB().Exec(ctx, `
		UPDATE finance_transaction
		SET category_id = ?, type = ?, amount_cents = ?, title = ?, note = ?, occurred_at = ?
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
		nullableID(categoryID), txType, amountCents, title, note, occurredAt, id, userID)
	if err != nil {
		return 0, err
	}
	return id, nil
}

// DeleteTransaction 软删除流水。
func DeleteTransaction(ctx context.Context, userID, id int64) error {
	result, err := g.DB().Exec(ctx, `
		UPDATE finance_transaction SET deleted_at = NOW(3)
		WHERE id = ? AND user_id = ? AND deleted_at IS NULL`, id, userID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return invalid("流水不存在或已被删除")
	}
	return nil
}
