package finance

import (
	"context"

	v1 "study/api/api/finance/v1"
	financelogic "study/api/internal/logic/finance"
)

func (c *ControllerV1) ImportTemplate(ctx context.Context, req *v1.ImportTemplateReq) (res *v1.ImportTemplateRes, err error) {
	filename, content := financelogic.ImportTemplate()
	return &v1.ImportTemplateRes{
		Filename: filename,
		Content:  content,
		Guide:    financelogic.ImportGuide(),
	}, nil
}

func (c *ControllerV1) ImportPreview(ctx context.Context, req *v1.ImportPreviewReq) (res *v1.ImportPreviewRes, err error) {
	preview, err := financelogic.ParseImport(ctx, currentUserID(ctx), req.Content)
	if err != nil {
		return nil, err
	}
	res = &v1.ImportPreviewRes{
		Total: preview.Total, ValidCount: preview.ValidCount,
		DuplicateCount: preview.DuplicateCount, ErrorCount: preview.ErrorCount,
		NewCategories: preview.NewCategories,
		Rows:          make([]v1.ImportRow, 0, len(preview.Rows)),
		Guide:         financelogic.ImportGuide(),
		Filename:      financelogic.ImportTemplateName(),
		Columns:       financelogic.ImportColumns(),
	}
	for _, row := range preview.Rows {
		res.Rows = append(res.Rows, v1.ImportRow{
			Line: row.Line, Date: row.Date, TypeName: row.TypeName, Category: row.Category,
			AmountCents: row.AmountCents, Title: row.Title, Note: row.Note,
			Status: row.Status, Message: row.Message,
		})
	}
	return res, nil
}

func (c *ControllerV1) ImportCommit(ctx context.Context, req *v1.ImportCommitReq) (res *v1.ImportCommitRes, err error) {
	result, err := financelogic.CommitImport(ctx, currentUserID(ctx), req.Content)
	if err != nil {
		return nil, err
	}
	return &v1.ImportCommitRes{
		Imported: result.Imported, Skipped: result.Skipped,
		ErrorCount: result.ErrorCount, NewCategories: result.NewCategories,
	}, nil
}

func (c *ControllerV1) Export(ctx context.Context, req *v1.ExportReq) (res *v1.ExportRes, err error) {
	query := financelogic.TransactionQuery{
		Month: req.Month, Type: req.Type, CategoryID: req.CategoryId, Keyword: req.Keyword,
	}
	filename, content, total, err := financelogic.ExportCSV(ctx, currentUserID(ctx), query)
	if err != nil {
		return nil, err
	}
	return &v1.ExportRes{Filename: filename, Content: content, Total: total}, nil
}
