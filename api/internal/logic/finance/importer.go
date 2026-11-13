package finance

import (
	"bytes"
	"context"
	"encoding/csv"
	"fmt"
	"math"
	"strconv"
	"strings"

	"github.com/gogf/gf/v2/database/gdb"
	"github.com/gogf/gf/v2/frame/g"
)

const (
	importTemplateName = "记账导入模板.csv"
	importGuide        = "列说明：日期 YYYY-MM-DD（也支持 YYYY/MM/DD）；类型填「收入」或「支出」；金额单位为元，支持两位小数，恒为正数；分类不存在时会自动创建；标题留空时默认使用分类名；备注可留空。文件需为 UTF-8 编码的 CSV，重复记录会自动跳过。"
	maxImportBytes     = 2 * 1024 * 1024
	maxImportRows      = 5000
)

var importColumns = []string{"日期", "类型", "分类", "金额", "标题", "备注"}

var columnAliases = map[string][]string{
	"date":     {"日期", "date", "交易日期", "时间", "记账日期"},
	"type":     {"类型", "type", "收支", "收支类型", "方向"},
	"category": {"分类", "category", "类别", "支出分类"},
	"amount":   {"金额", "amount", "金额(元)", "金额（元）", "金额/元"},
	"title":    {"标题", "title", "交易", "摘要", "名称", "项目", "说明事项"},
	"note":     {"备注", "note", "说明", "描述", "memo"},
}

// ImportRow 导入文件中的一行及其校验结果。
type ImportRow struct {
	Line        int
	Date        string
	Type        int
	TypeName    string
	Category    string
	AmountCents int64
	Title       string
	Note        string
	Status      string // ok / duplicate / error
	Message     string
}

// ImportPreview 导入文件解析结果。
type ImportPreview struct {
	Total          int
	ValidCount     int
	DuplicateCount int
	ErrorCount     int
	NewCategories  []string
	Rows           []ImportRow
}

// ImportResult 导入执行结果。
type ImportResult struct {
	Imported      int
	Skipped       int
	ErrorCount    int
	NewCategories []string
}

func ImportGuide() string {
	return importGuide
}

func ImportTemplateName() string {
	return importTemplateName
}

func ImportColumns() []string {
	return append([]string{}, importColumns...)
}

// ImportTemplate 生成可直接用 Excel 打开的 CSV 模板。
func ImportTemplate() (string, string) {
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)
	writer.UseCRLF = true
	_ = writer.Write(importColumns)
	_ = writer.Write([]string{"2026-11-13", "支出", "日常饮食", "32.50", "午餐", "公司楼下"})
	_ = writer.Write([]string{"2026-11-13", "收入", "收入", "15800.00", "薪资收入", ""})
	writer.Flush()
	return importTemplateName, buf.String()
}

func normalizeHeader(value string) string {
	return strings.ToLower(strings.TrimSpace(strings.TrimPrefix(value, "\uFEFF")))
}

func headerIndex(header []string) (map[string]int, error) {
	index := make(map[string]int)
	for i, cell := range header {
		name := normalizeHeader(cell)
		for key, aliases := range columnAliases {
			if _, exists := index[key]; exists {
				continue
			}
			for _, alias := range aliases {
				if name == strings.ToLower(alias) {
					index[key] = i
					break
				}
			}
		}
	}
	for _, required := range []string{"date", "type", "amount"} {
		if _, exists := index[required]; !exists {
			return nil, invalid("缺少必需列：日期 / 类型 / 金额，请先下载导入模板")
		}
	}
	return index, nil
}

func cellAt(record []string, index map[string]int, key string) string {
	position, exists := index[key]
	if !exists || position >= len(record) {
		return ""
	}
	return strings.TrimSpace(record[position])
}

func parseType(value string) (int, string, error) {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "收入", "income", "1", "+", "in":
		return 1, "收入", nil
	case "支出", "expense", "2", "-", "out":
		return 2, "支出", nil
	default:
		return 0, "", invalid("类型需为「收入」或「支出」")
	}
}

func parseAmount(value string) (int64, error) {
	value = strings.NewReplacer(",", "", "¥", "", "￥", "", "元", "", " ", "").Replace(value)
	amount, err := strconv.ParseFloat(value, 64)
	if err != nil || math.IsNaN(amount) || math.IsInf(amount, 0) || amount <= 0 {
		return 0, invalid("金额需为大于 0 的数字（单位：元）")
	}
	cents := int64(math.Round(amount * 100))
	if cents <= 0 {
		return 0, invalid("金额最小为 0.01 元")
	}
	return cents, nil
}

func categoryKey(kind int, name string) string {
	return fmt.Sprintf("%d|%s", kind, name)
}

func existingFingerprints(ctx context.Context, userID int64) (map[string]bool, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT type, amount_cents, title, note,
		       DATE_FORMAT(DATE_ADD(occurred_at, INTERVAL 8 HOUR), '%Y-%m-%d') AS day
		FROM finance_transaction WHERE user_id = ? AND deleted_at IS NULL`, userID)
	if err != nil {
		return nil, err
	}
	var list []struct {
		Type   int    `orm:"type"`
		Amount int64  `orm:"amount_cents"`
		Title  string `orm:"title"`
		Note   string `orm:"note"`
		Day    string `orm:"day"`
	}
	if err = rows.Structs(&list); err != nil {
		return nil, err
	}
	set := make(map[string]bool, len(list))
	for _, item := range list {
		set[fingerprint(item.Type, item.Amount, item.Day, item.Title, item.Note)] = true
	}
	return set, nil
}

func fingerprint(txType int, amount int64, day, title, note string) string {
	return fmt.Sprintf("%d|%d|%s|%s|%s", txType, amount, day, title, note)
}

func existingCategories(ctx context.Context, userID int64) (map[string]int64, error) {
	rows, err := g.DB().GetAll(ctx,
		"SELECT id, name, kind FROM finance_category WHERE user_id = ?", userID)
	if err != nil {
		return nil, err
	}
	var list []struct {
		ID   int64  `orm:"id"`
		Name string `orm:"name"`
		Kind int    `orm:"kind"`
	}
	if err = rows.Structs(&list); err != nil {
		return nil, err
	}
	set := make(map[string]int64, len(list))
	for _, item := range list {
		set[categoryKey(item.Kind, item.Name)] = item.ID
	}
	return set, nil
}

// ParseImport 解析 CSV 内容并逐行校验，不写入数据库。
func ParseImport(ctx context.Context, userID int64, content string) (*ImportPreview, error) {
	if len(content) > maxImportBytes {
		return nil, invalid("文件过大，请控制在 2MB 以内")
	}
	text := strings.TrimPrefix(content, "\uFEFF")
	text = strings.ReplaceAll(text, "\r\n", "\n")
	text = strings.ReplaceAll(text, "\r", "\n")
	lines := strings.Split(text, "\n")
	if len(lines) > 0 && strings.Contains(lines[0], "\t") && !strings.Contains(lines[0], ",") {
		for i := range lines {
			lines[i] = strings.ReplaceAll(lines[i], "\t", ",")
		}
		text = strings.Join(lines, "\n")
	}

	reader := csv.NewReader(strings.NewReader(text))
	reader.FieldsPerRecord = -1
	reader.TrimLeadingSpace = true
	reader.LazyQuotes = true
	records, err := reader.ReadAll()
	if err != nil {
		return nil, invalid("CSV 解析失败：%v", err)
	}
	cleaned := make([][]string, 0, len(records))
	for _, record := range records {
		blank := true
		for _, cell := range record {
			if strings.TrimSpace(cell) != "" {
				blank = false
				break
			}
		}
		if !blank {
			cleaned = append(cleaned, record)
		}
	}
	if len(cleaned) == 0 {
		return nil, invalid("文件内容为空")
	}
	if len(cleaned)-1 > maxImportRows {
		return nil, invalid("单次最多导入 %d 行，当前为 %d 行", maxImportRows, len(cleaned)-1)
	}
	index, err := headerIndex(cleaned[0])
	if err != nil {
		return nil, err
	}

	known, err := existingFingerprints(ctx, userID)
	if err != nil {
		return nil, err
	}
	categories, err := existingCategories(ctx, userID)
	if err != nil {
		return nil, err
	}

	preview := &ImportPreview{
		Rows:          make([]ImportRow, 0, len(cleaned)-1),
		NewCategories: make([]string, 0),
	}
	seen := make(map[string]bool)
	newCategorySet := make(map[string]bool)
	for i := 1; i < len(cleaned); i++ {
		record := cleaned[i]
		row := ImportRow{
			Line:     i + 1,
			Category: cellAt(record, index, "category"),
			Title:    cellAt(record, index, "title"),
			Note:     cellAt(record, index, "note"),
			Status:   "ok",
		}
		rawDate := cellAt(record, index, "date")
		occurredAt, dateErr := parseDay(rawDate)
		if dateErr == nil {
			row.Date = occurredAt.Format("2006-01-02")
		}
		txType, typeName, typeErr := parseType(cellAt(record, index, "type"))
		row.Type, row.TypeName = txType, typeName
		amount, amountErr := parseAmount(cellAt(record, index, "amount"))
		row.AmountCents = amount
		if row.Category == "" {
			row.Category = "未分类"
		}
		if row.Title == "" {
			row.Title = row.Category
		}
		if len(row.Title) > 64 {
			row.Title = row.Title[:64]
		}
		if len(row.Note) > 255 {
			row.Note = row.Note[:255]
		}

		switch {
		case dateErr != nil:
			row.Status, row.Message = "error", "日期无效：" + rawDate
		case typeErr != nil:
			row.Status, row.Message = "error", typeErr.Error()
		case amountErr != nil:
			row.Status, row.Message = "error", amountErr.Error()
		default:
			key := fingerprint(txType, amount, row.Date, row.Title, row.Note)
			if known[key] || seen[key] {
				row.Status, row.Message = "duplicate", "与已有流水重复，将跳过"
			} else {
				seen[key] = true
				categoryIDKey := categoryKey(txType, row.Category)
				if _, exists := categories[categoryIDKey]; !exists && !newCategorySet[categoryIDKey] {
					newCategorySet[categoryIDKey] = true
					preview.NewCategories = append(preview.NewCategories, fmt.Sprintf("%s（%s）", row.Category, typeName))
				}
			}
		}

		preview.Rows = append(preview.Rows, row)
		switch row.Status {
		case "ok":
			preview.ValidCount++
		case "duplicate":
			preview.DuplicateCount++
		default:
			preview.ErrorCount++
		}
	}
	preview.Total = len(preview.Rows)
	return preview, nil
}

// CommitImport 校验并批量写入流水，自动创建缺失分类，整体在一个事务内完成。
func CommitImport(ctx context.Context, userID int64, content string) (*ImportResult, error) {
	preview, err := ParseImport(ctx, userID, content)
	if err != nil {
		return nil, err
	}
	result := &ImportResult{
		Skipped:       preview.DuplicateCount,
		ErrorCount:    preview.ErrorCount,
		NewCategories: make([]string, 0),
	}
	if preview.ValidCount == 0 {
		return result, nil
	}

	categories, err := existingCategories(ctx, userID)
	if err != nil {
		return nil, err
	}
	newCategorySet := make(map[string]bool)
	baseSort := len(categories)
	err = g.DB().Transaction(ctx, func(ctx context.Context, tx gdb.TX) error {
		for _, row := range preview.Rows {
			if row.Status != "ok" {
				continue
			}
			key := categoryKey(row.Type, row.Category)
			if _, exists := categories[key]; !exists {
				sortOrder := baseSort + len(newCategorySet)
				insert, insertErr := tx.Exec(`
					INSERT INTO finance_category (user_id, name, kind, color, sort_order)
					VALUES (?, ?, ?, ?, ?)`, userID, row.Category, row.Type, defaultCategoryColor, sortOrder)
				if insertErr != nil {
					return insertErr
				}
				id, idErr := insert.LastInsertId()
				if idErr != nil {
					return idErr
				}
				categories[key] = id
				if !newCategorySet[key] {
					newCategorySet[key] = true
					result.NewCategories = append(result.NewCategories, fmt.Sprintf("%s（%s）", row.Category, row.TypeName))
				}
			}
			occurredAt, _ := parseDay(row.Date)
			_, insertErr := tx.Exec(`
				INSERT INTO finance_transaction
					(user_id, category_id, type, amount_cents, title, note, occurred_at)
				VALUES (?, ?, ?, ?, ?, ?, ?)`,
				userID, categories[key], row.Type, row.AmountCents, row.Title, row.Note, occurredAt)
			if insertErr != nil {
				return insertErr
			}
			result.Imported++
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return result, nil
}

// ExportCSV 按筛选条件导出全部流水为 CSV 文本。
func ExportCSV(ctx context.Context, userID int64, query TransactionQuery) (string, string, int, error) {
	query.All = true
	rows, total, _, _, err := ListTransactions(ctx, userID, query)
	if err != nil {
		return "", "", 0, err
	}
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)
	writer.UseCRLF = true
	_ = writer.Write(importColumns)
	for _, row := range rows {
		typeName := "支出"
		if row.Type == 1 {
			typeName = "收入"
		}
		_ = writer.Write([]string{
			row.Date, typeName, row.Category,
			strconv.FormatFloat(float64(row.AmountCents)/100, 'f', 2, 64),
			row.Title, row.Note,
		})
	}
	writer.Flush()
	name := "记账流水_全部.csv"
	if query.Month != "" {
		name = fmt.Sprintf("记账流水_%s.csv", query.Month)
	}
	return name, buf.String(), total, nil
}
