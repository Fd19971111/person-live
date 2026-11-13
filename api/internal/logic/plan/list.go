package plan

import (
	"context"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
)

// ListCategories 返回当前用户未隐藏的计划分类，按排序值升序。
func ListCategories(ctx context.Context, userID int64) ([]Category, error) {
	rows, err := g.DB().GetAll(ctx, `
		SELECT c.id AS id, c.name AS name, c.color AS color, c.sort_order AS sort_order,
		       (SELECT COUNT(*) FROM plan_task t
		          WHERE t.category_id = c.id AND t.deleted_at IS NULL) AS task_count
		FROM plan_category c
		WHERE c.user_id = ? AND c.deleted_at IS NULL
		ORDER BY c.sort_order, c.id`, userID)
	if err != nil {
		return nil, err
	}
	var list []struct {
		ID    int64  `orm:"id"`
		Name  string `orm:"name"`
		Color string `orm:"color"`
		Sort  int    `orm:"sort_order"`
		Count int    `orm:"task_count"`
	}
	if err = rows.Structs(&list); err != nil {
		return nil, err
	}
	categories := make([]Category, 0, len(list))
	for _, item := range list {
		categories = append(categories, Category{
			ID: item.ID, Name: item.Name, Color: item.Color,
			SortOrder: item.Sort, TaskCount: item.Count,
		})
	}
	return categories, nil
}

// ListTasks 按筛选条件返回任务，已删除的分类会退化为「未分类」。
func ListTasks(ctx context.Context, userID int64, q TaskQuery) ([]Task, error) {
	where := []string{"t.user_id = ?", "t.deleted_at IS NULL"}
	args := []any{userID}
	if q.Status >= StatusPending && q.Status <= StatusDone {
		where = append(where, "t.status = ?")
		args = append(args, q.Status)
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

	rows, err := g.DB().GetAll(ctx, `
		SELECT t.id AS id, t.title AS title, t.note AS note, t.status AS status,
		       t.sort_order AS sort_order,
		       COALESCE(DATE_FORMAT(t.due_date, '%Y-%m-%d'), '') AS due_date,
		       COALESCE(t.category_id, 0) AS category_id,
		       COALESCE(c.name, '未分类') AS category,
		       COALESCE(c.color, '#B8B3A6') AS color
		FROM plan_task t
		LEFT JOIN plan_category c ON c.id = t.category_id AND c.deleted_at IS NULL
		WHERE `+strings.Join(where, " AND ")+`
		ORDER BY t.status, t.sort_order, t.id`, args...)
	if err != nil {
		return nil, err
	}
	var list []struct {
		ID         int64  `orm:"id"`
		Title      string `orm:"title"`
		Note       string `orm:"note"`
		Status     int    `orm:"status"`
		Sort       int    `orm:"sort_order"`
		DueDate    string `orm:"due_date"`
		CategoryID int64  `orm:"category_id"`
		Category   string `orm:"category"`
		Color      string `orm:"color"`
	}
	if err = rows.Structs(&list); err != nil {
		return nil, err
	}
	tasks := make([]Task, 0, len(list))
	for _, item := range list {
		tasks = append(tasks, Task{
			ID: item.ID, Title: item.Title, Note: item.Note, Status: item.Status,
			DueDate: item.DueDate, CategoryID: item.CategoryID,
			Category: item.Category, Color: item.Color, SortOrder: item.Sort,
		})
	}
	return tasks, nil
}
