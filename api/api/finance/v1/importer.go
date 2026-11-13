package v1

import "github.com/gogf/gf/v2/frame/g"

// ImportTemplateReq 下载导入模板。
type ImportTemplateReq struct {
	g.Meta `path:"/finance/import-template" method:"get" tags:"记账" summary:"下载记账导入模板"`
}

type ImportTemplateRes struct {
	Filename string `json:"filename"`
	Content  string `json:"content"`
	Guide    string `json:"guide"`
}

// ImportRow 导入文件中的一行及其校验结果。
type ImportRow struct {
	Line        int    `json:"line"`
	Date        string `json:"date"`
	TypeName    string `json:"typeName"`
	Category    string `json:"category"`
	AmountCents int64  `json:"amountCents"`
	Title       string `json:"title"`
	Note        string `json:"note"`
	Status      string `json:"status"` // ok / duplicate / error
	Message     string `json:"message"`
}

// ImportPreviewReq 解析导入文件，只做校验不写库。
type ImportPreviewReq struct {
	g.Meta  `path:"/finance/import/preview" method:"post" tags:"记账" summary:"预览记账导入文件"`
	Content string `json:"content"`
}

type ImportPreviewRes struct {
	Total          int          `json:"total"`
	ValidCount     int          `json:"validCount"`
	DuplicateCount int          `json:"duplicateCount"`
	ErrorCount     int          `json:"errorCount"`
	NewCategories  []string     `json:"newCategories"`
	Rows           []ImportRow  `json:"rows"`
	Guide          string       `json:"guide"`
	Filename       string       `json:"filename"`
	Columns        []string     `json:"columns"`
}

// ImportCommitReq 确认导入，服务端会重新校验后再写入。
type ImportCommitReq struct {
	g.Meta  `path:"/finance/import/commit" method:"post" tags:"记账" summary:"确认导入记账流水"`
	Content string `json:"content"`
}

type ImportCommitRes struct {
	Imported      int      `json:"imported"`
	Skipped       int      `json:"skipped"`
	ErrorCount    int      `json:"errorCount"`
	NewCategories []string `json:"newCategories"`
}

// ExportReq 按当前筛选条件导出 CSV。
type ExportReq struct {
	g.Meta     `path:"/finance/export" method:"get" tags:"记账" summary:"导出记账流水"`
	Month      string `json:"month"      in:"query"`
	Type       int    `json:"type"       in:"query"`
	CategoryId int64  `json:"categoryId" in:"query"`
	Keyword    string `json:"keyword"    in:"query"`
}

type ExportRes struct {
	Filename string `json:"filename"`
	Content  string `json:"content"`
	Total    int    `json:"total"`
}
