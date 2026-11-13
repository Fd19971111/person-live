package finance

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/finance/v1"
	"study/api/internal/consts"
	financelogic "study/api/internal/logic/finance"
)

type ControllerV1 struct{}

func NewV1() *ControllerV1 {
	return &ControllerV1{}
}

func (c *ControllerV1) Overview(ctx context.Context, req *v1.OverviewReq) (res *v1.OverviewRes, err error) {
	userID := g.RequestFromCtx(ctx).GetCtxVar(consts.CtxKeyUserId).Int64()
	data, err := financelogic.GetOverview(ctx, userID, req.Month)
	if err != nil {
		return nil, err
	}

	res = &v1.OverviewRes{
		Month:            data.Month,
		IncomeCents:      data.IncomeCents,
		ExpenseCents:     data.ExpenseCents,
		BalanceCents:     data.BalanceCents,
		IncomeChangePct:  data.IncomeChangePct,
		ExpenseChangePct: data.ExpenseChangePct,
		BalanceChangePct: data.BalanceChangePct,
		BalanceRate:      data.BalanceRate,
		TotalCount:       data.TotalCount,
		Trend:            make([]v1.TrendPoint, 0, len(data.Trend)),
		Categories:       make([]v1.CategoryShare, 0, len(data.Categories)),
		Recent:           make([]v1.TransactionItem, 0, len(data.Recent)),
	}
	for _, point := range data.Trend {
		res.Trend = append(res.Trend, v1.TrendPoint{
			Month:        point.Month,
			Label:        point.Label,
			IncomeCents:  point.IncomeCents,
			ExpenseCents: point.ExpenseCents,
		})
	}
	for _, share := range data.Categories {
		res.Categories = append(res.Categories, v1.CategoryShare{
			Name:        share.Name,
			Color:       share.Color,
			AmountCents: share.AmountCents,
			Percent:     share.Percent,
		})
	}
	for _, item := range data.Recent {
		res.Recent = append(res.Recent, v1.TransactionItem{
			ID:          item.ID,
			Date:        item.Date,
			Title:       item.Title,
			Category:    item.Category,
			Type:        item.Type,
			AmountCents: item.AmountCents,
		})
	}
	return res, nil
}
