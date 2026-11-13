package main

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

// 一次性数据修复：把指定用户的模块全部恢复为可见，并按模块库顺序重排。
func main() {
	db, err := sql.Open("mysql", "root:root@tcp(127.0.0.1:3306)/study?charset=utf8mb4&parseTime=true")
	if err != nil {
		fmt.Println("open:", err)
		return
	}
	defer db.Close()

	const userID = 3
	order := []string{"finance", "music", "plans", "learning", "movies", "travel", "fitness", "inspiration", "album"}
	for index, key := range order {
		if _, err = db.Exec("UPDATE user_module SET hidden = 0, sort_order = ? WHERE user_id = ? AND module_key = ?", index, userID, key); err != nil {
			fmt.Println("update:", err)
			return
		}
	}

	rows, err := db.Query("SELECT module_key, hidden, sort_order FROM user_module WHERE user_id = ? ORDER BY sort_order, id", userID)
	if err != nil {
		fmt.Println("query:", err)
		return
	}
	defer rows.Close()
	for rows.Next() {
		var key string
		var hidden, sortOrder int
		_ = rows.Scan(&key, &hidden, &sortOrder)
		fmt.Printf("%d\t%s\thidden=%d\n", sortOrder, key, hidden)
	}
}
