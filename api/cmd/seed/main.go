// Command seed 创建演示账号 admin / 123456，并写入记账演示数据。
package main

import (
	"context"
	"fmt"
	"time"

	_ "github.com/gogf/gf/contrib/drivers/mysql/v2"
	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/gctx"
	"github.com/gogf/gf/v2/os/gtime"
	"golang.org/x/crypto/bcrypt"

	"study/api/internal/utility"
)

var cst = time.FixedZone("CST", 8*3600)

func main() {
	ctx := gctx.GetInitCtx()

	hash, err := bcrypt.GenerateFromPassword([]byte("123456"), 12)
	if err != nil {
		panic(err)
	}

	userID, err := ensureUser(ctx, string(hash))
	if err != nil {
		panic(err)
	}
	fmt.Println("演示账号已就绪: admin / 123456")

	if err = seedFinance(ctx, userID); err != nil {
		panic(err)
	}
}

func ensureUser(ctx context.Context, hash string) (int64, error) {
	count, err := g.DB().Model("user").Ctx(ctx).Where("email", "admin").Count()
	if err != nil {
		return 0, err
	}
	if count == 0 {
		return g.DB().Model("user").Ctx(ctx).Data(g.Map{
			"uid":               utility.NewULID(),
			"email":             "admin",
			"password_hash":     hash,
			"nickname":          "Admin",
			"email_verified_at": gtime.Now(),
		}).InsertAndGetId()
	}
	if _, err = g.DB().Model("user").Ctx(ctx).Where("email", "admin").
		Data(g.Map{"password_hash": hash}).Update(); err != nil {
		return 0, err
	}
	record, err := g.DB().Model("user").Ctx(ctx).Fields("id").Where("email", "admin").One()
	if err != nil {
		return 0, err
	}
	return record["id"].Int64(), nil
}

// seedFinance 重置演示账号的记账数据，写入最近六个月流水。
func seedFinance(ctx context.Context, userID int64) error {
	if _, err := g.DB().Model("finance_transaction").Ctx(ctx).Where("user_id", userID).Delete(); err != nil {
		return err
	}
	if _, err := g.DB().Model("finance_category").Ctx(ctx).Where("user_id", userID).Delete(); err != nil {
		return err
	}

	categories := []struct {
		Name  string
		Color string
		Kind  int
	}{
		{"收入", "#6C9E8D", 1},
		{"日常饮食", "#E56F4A", 2},
		{"居住生活", "#E2AF62", 2},
		{"文化与学习", "#6C9E8D", 2},
		{"其他", "#B89CD5", 2},
	}
	categoryIDs := make(map[string]int64, len(categories))
	for i, item := range categories {
		id, err := g.DB().Model("finance_category").Ctx(ctx).Data(g.Map{
			"user_id":    userID,
			"name":       item.Name,
			"kind":       item.Kind,
			"color":      item.Color,
			"sort_order": i,
		}).InsertAndGetId()
		if err != nil {
			return err
		}
		categoryIDs[item.Name] = id
	}

	expenses := []struct {
		Title    string
		Category string
		Amount   int64
		Day      int
	}{
		{"房租", "居住生活", 320000, 5},
		{"水电燃气", "居住生活", 22000, 6},
		{"生鲜采购", "日常饮食", 45600, 16},
		{"Whole Foods", "日常饮食", 34260, 21},
		{"周末聚餐", "日常饮食", 26800, 23},
		{"工作日午餐", "日常饮食", 4800, 8},
		{"咖啡", "日常饮食", 3200, 9},
		{"地铁通勤", "其他", 12000, 12},
		{"健身月卡", "其他", 19900, 11},
		{"Spotify", "其他", 6800, 19},
		{"电影票", "其他", 6800, 26},
		{"方所书店", "文化与学习", 18600, 24},
		{"线上课程", "文化与学习", 29900, 18},
		{"书籍", "文化与学习", 12800, 27},
	}
	incomes := []int64{1580000, 1620000, 1700000, 1640000, 1710000, 1842000}
	// 让每月支出略有波动，避免折线完全重合。
	expenseDeltas := []int64{-6000, 12000, -8000, 24000, 9000, 0}

	now := time.Now().In(cst)
	for i := 5; i >= 0; i-- {
		monthStart := time.Date(now.Year(), now.Month(), 1, 12, 0, 0, 0, cst).AddDate(0, -i, 0)
		rows := make([]g.Map, 0, len(expenses)+1)
		rows = append(rows, g.Map{
			"user_id":      userID,
			"category_id":  categoryIDs["收入"],
			"type":         1,
			"amount_cents": incomes[5-i],
			"title":        "薪资收入",
			"occurred_at":  monthStart.AddDate(0, 0, 9),
		})
		for j, item := range expenses {
			if i == 0 && item.Day > now.Day() {
				continue
			}
			amount := item.Amount
			if j == 4 {
				amount += expenseDeltas[5-i]
			}
			rows = append(rows, g.Map{
				"user_id":      userID,
				"category_id":  categoryIDs[item.Category],
				"type":         2,
				"amount_cents": amount,
				"title":        item.Title,
				"occurred_at":  monthStart.AddDate(0, 0, item.Day-1),
			})
		}
		if _, err := g.DB().Model("finance_transaction").Ctx(ctx).Data(rows).Insert(); err != nil {
			return err
		}
	}

	fmt.Println("记账演示数据已写入: 6 个月流水")
	return nil
}
