package main

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/golang-jwt/jwt/v5"
)

type claims struct {
	UserID int64  `json:"uid"`
	Uid    string `json:"sub_uid"`
	jwt.RegisteredClaims
}

func main() {
	db, err := sql.Open("mysql", "root:root@tcp(127.0.0.1:3306)/study?charset=utf8mb4&parseTime=true")
	if err != nil {
		fmt.Println("open:", err)
		return
	}
	defer db.Close()

	var id int64
	var uid string
	if err := db.QueryRow("SELECT id, uid FROM user WHERE id = ?", os.Args[1]).Scan(&id, &uid); err != nil {
		fmt.Println("user:", err)
		return
	}
	now := time.Now()
	signed, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims{
		UserID: id,
		Uid:    uid,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   uid,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(20 * time.Minute)),
		},
	}).SignedString([]byte("study-dev-secret-please-change-in-production"))
	if err != nil {
		fmt.Println("sign:", err)
		return
	}
	fmt.Println(signed)
}
