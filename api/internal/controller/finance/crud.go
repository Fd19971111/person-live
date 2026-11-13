package finance

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/finance/v1"
	"study/api/internal/consts"
	financelogic "study/api/internal/logic/finance"
)

func currentUserID(ctx context.Context) int64 {
	return g.RequestFromCtx(ctx).GetCtxVar(consts.CtxKeyUserId).Int64()
}

func (c *ControllerV1) Categories(ctx context.Context, req *v1.CategoriesReq) (res *v1.CategoriesRes, err error) {
	list, err := financelogic.ListCategories(ctx, currentUserID(ctx))
	if err != nil {
		return nil, err
	}
	res = &v1.CategoriesRes{Items: make([]v1.CategoryItem, 0, len(list))}
	for _, item := range list {
		res.Items = append(res.Items, v1.CategoryItem{
			Id: item.ID, Name: item.Name, Kind: item.Kind, Color: item.Color,
			SortOrder: item.SortOrder, TransactionCount: item.TransactionCount,
		})
	}
	return res, nil
}

func (c *ControllerV1) SaveCategory(ctx context.Context, req *v1.CategorySaveReq) (res *v1.CategorySaveRes, err error) {
	id, err := financelogic.SaveCategory(ctx, currentUserID(ctx), req.Id, req.Name, req.Kind, req.Color, req.SortOrder)
	if err != nil {
		return nil, err
	}
	return &v1.CategorySaveRes{Id: id}, nil
}

func (c *ControllerV1) DeleteCategory(ctx context.Context, req *v1.CategoryDeleteReq) (res *v1.CategoryDeleteRes, err error) {
	if err = financelogic.DeleteCategory(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.CategoryDeleteRes{}, nil
}

func (c *ControllerV1) Transactions(ctx context.Context, req *v1.TransactionsReq) (res *v1.TransactionsRes, err error) {
	query := financelogic.TransactionQuery{
		Month: req.Month, Type: req.Type, CategoryID: req.CategoryId,
		Keyword: req.Keyword, Page: req.Page, PageSize: req.PageSize,
	}
	items, total, income, expense, err := financelogic.ListTransactions(ctx, currentUserID(ctx), query)
	if err != nil {
		return nil, err
	}
	res = &v1.TransactionsRes{
		Items: make([]v1.TransactionRow, 0, len(items)), Total: total,
		Page: query.Page, PageSize: query.PageSize,
		IncomeCents: income, ExpenseCents: expense,
	}
	if res.Page < 1 {
		res.Page = 1
	}
	if res.PageSize < 1 || res.PageSize > 500 {
		res.PageSize = 20
	}
	for _, item := range items {
		res.Items = append(res.Items, v1.TransactionRow{
			Id: item.ID, Date: item.Date, Title: item.Title, Category: item.Category,
			CategoryId: item.CategoryID, Type: item.Type, AmountCents: item.AmountCents, Note: item.Note,
		})
	}
	return res, nil
}

func (c *ControllerV1) SaveTransaction(ctx context.Context, req *v1.TransactionSaveReq) (res *v1.TransactionSaveRes, err error) {
	id, err := financelogic.SaveTransaction(ctx, currentUserID(ctx), req.Id, req.Type,
		req.CategoryId, req.AmountCents, req.Title, req.Note, req.Date, req.CategoryName)
	if err != nil {
		return nil, err
	}
	return &v1.TransactionSaveRes{Id: id}, nil
}

func (c *ControllerV1) DeleteTransaction(ctx context.Context, req *v1.TransactionDeleteReq) (res *v1.TransactionDeleteRes, err error) {
	if err = financelogic.DeleteTransaction(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.TransactionDeleteRes{}, nil
}
