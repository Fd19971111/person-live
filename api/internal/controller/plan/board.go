package plan

import (
	"context"

	v1 "study/api/api/plan/v1"
	planlogic "study/api/internal/logic/plan"
)

// Board 计划看板数据。
func (c *ControllerV1) Board(ctx context.Context, req *v1.PlanBoardReq) (res *v1.PlanBoardRes, err error) {
	board, err := planlogic.GetBoard(ctx, currentUserID(ctx), req.Week)
	if err != nil {
		return nil, err
	}

	res = &v1.PlanBoardRes{
		Week: v1.PlanWeek{
			Start: board.Week.Start,
			End:   board.Week.End,
			Label: board.Week.Label,
		},
		Summary: v1.PlanBoardSummary{
			Total: board.Summary.Total,
			Done:  board.Summary.Done,
			Rate:  board.Summary.Rate,
		},
		Categories: toCategoryItems(board.Categories),
		Columns:    make([]v1.PlanColumn, 0, len(board.Columns)),
		Timeline:   make([]v1.PlanDay, 0, len(board.Timeline)),
	}
	for _, column := range board.Columns {
		res.Columns = append(res.Columns, v1.PlanColumn{
			Status: column.Status,
			Name:   column.Name,
			Count:  column.Count,
			Items:  toTaskItems(column.Items),
		})
	}
	for _, day := range board.Timeline {
		res.Timeline = append(res.Timeline, v1.PlanDay{
			Date:    day.Date,
			Label:   day.Label,
			Weekday: day.Weekday,
			Day:     day.Day,
			Items:   toTaskItems(day.Items),
		})
	}
	return res, nil
}
