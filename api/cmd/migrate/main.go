// Command migrate 按文件名顺序执行 manifest/sql 下的 SQL，并记录已应用的版本。
package main

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	_ "github.com/go-sql-driver/mysql"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/gctx"
)

func main() {
	if err := run(gctx.GetInitCtx()); err != nil {
		fmt.Fprintln(os.Stderr, "迁移失败:", err)
		os.Exit(1)
	}
}

func run(ctx context.Context) error {
	link := g.Cfg().MustGet(ctx, "database.default.link").String()
	if link == "" {
		return fmt.Errorf("未配置 database.default.link")
	}
	link = strings.TrimPrefix(link, "mysql:")
	if strings.Contains(link, "?") {
		link += "&multiStatements=true"
	} else {
		link += "?multiStatements=true"
	}

	db, err := sql.Open("mysql", link)
	if err != nil {
		return err
	}
	defer db.Close()

	if err = db.PingContext(ctx); err != nil {
		return fmt.Errorf("连接数据库失败: %w", err)
	}

	if _, err = db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS schema_migration (
		version    VARCHAR(64) NOT NULL,
		applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
		PRIMARY KEY (version)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`); err != nil {
		return err
	}

	files, err := filepath.Glob("manifest/sql/*.sql")
	if err != nil {
		return err
	}
	sort.Strings(files)

	for _, file := range files {
		version := filepath.Base(file)
		var applied int
		if err = db.QueryRowContext(ctx,
			"SELECT COUNT(1) FROM schema_migration WHERE version = ?", version,
		).Scan(&applied); err != nil {
			return err
		}
		if applied > 0 {
			fmt.Println("已应用，跳过", version)
			continue
		}

		content, readErr := os.ReadFile(file)
		if readErr != nil {
			return readErr
		}
		if _, err = db.ExecContext(ctx, string(content)); err != nil {
			return fmt.Errorf("%s: %w", version, err)
		}
		if _, err = db.ExecContext(ctx,
			"INSERT INTO schema_migration (version) VALUES (?)", version,
		); err != nil {
			return err
		}
		fmt.Println("已应用", version)
	}
	return nil
}
