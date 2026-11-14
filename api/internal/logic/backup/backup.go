// Package backup 把单个用户的全部业务数据打包成可离线保存的归档文件。
// 归档是「数据可带走」的兜底手段：即使服务停掉，用户也握有完整副本。
package backup

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/gogf/gf/v2/frame/g"

	albumlogic "study/api/internal/logic/album"
)

// formatVersion 归档格式版本，字段结构变化时递增，方便日后的导入程序判定。
const formatVersion = "1"

// tables 参与导出的业务表白名单。
// 刻意不包含 user_session / auth_token，避免把会话凭证带进归档文件。
var tables = []string{
	"user_module",
	"finance_category",
	"finance_transaction",
	"plan_category",
	"plan_task",
	"study_course",
	"study_session",
	"study_note",
	"study_setting",
	"inspiration_item",
	"movie_item",
	"travel_trip",
	"fitness_record",
	"music_track",
	"album_category",
	"album_photo",
}

// cst 与相册域保持一致，日期按东八区输出。
var cst = time.FixedZone("CST", 8*3600)

// Archive 对应 data.json 的结构。
type Archive struct {
	Version    string                      `json:"version"`
	ExportedAt string                      `json:"exportedAt"`
	Note       string                      `json:"note"`
	Profile    map[string]any              `json:"profile"`
	Tables     map[string][]map[string]any `json:"tables"`
}

// Build 生成归档 ZIP 的字节内容与建议文件名。
func Build(ctx context.Context, userID int64) ([]byte, string, error) {
	now := time.Now().In(cst)
	archive := Archive{
		Version:    formatVersion,
		ExportedAt: now.Format("2006-01-02 15:04:05"),
		Note:       "tables 的键为数据库表名，photos/ 下是相册原图，file_name 与 album_photo 表一一对应。",
		Tables:     make(map[string][]map[string]any, len(tables)),
	}

	owner, err := profile(ctx, userID)
	if err != nil {
		return nil, "", err
	}
	archive.Profile = owner

	for _, table := range tables {
		rows, err := queryTable(ctx, table, userID)
		if err != nil {
			return nil, "", err
		}
		archive.Tables[table] = rows
	}

	payload, err := json.MarshalIndent(archive, "", "  ")
	if err != nil {
		return nil, "", err
	}

	buffer := &bytes.Buffer{}
	writer := zip.NewWriter(buffer)

	entry, err := writer.Create("data.json")
	if err != nil {
		return nil, "", err
	}
	if _, err = entry.Write(payload); err != nil {
		return nil, "", err
	}

	if err = writePhotos(writer, userID); err != nil {
		return nil, "", err
	}
	if err = writer.Close(); err != nil {
		return nil, "", err
	}

	name := fmt.Sprintf("lifehub-%s.zip", now.Format("20060102-1504"))
	return buffer.Bytes(), name, nil
}

// profile 只导出非敏感字段，密码哈希与验证令牌一律不落盘。
func profile(ctx context.Context, userID int64) (map[string]any, error) {
	record, err := g.DB().GetOne(ctx, `
		SELECT uid, email, nickname, avatar_url, email_verified_at, created_at
		FROM user WHERE id = ?`, userID)
	if err != nil {
		return nil, err
	}
	result := make(map[string]any, len(record))
	for column, value := range record {
		result[column] = value.Val()
	}
	return result, nil
}

// queryTable 以白名单表名查询单个用户的全部记录，表名不来自外部输入。
func queryTable(ctx context.Context, table string, userID int64) ([]map[string]any, error) {
	records, err := g.DB().GetAll(ctx,
		fmt.Sprintf("SELECT * FROM `%s` WHERE user_id = ? ORDER BY id", table), userID)
	if err != nil {
		return nil, err
	}
	rows := make([]map[string]any, 0, len(records))
	for _, record := range records {
		row := make(map[string]any, len(record))
		for column, value := range record {
			row[column] = value.Val()
		}
		rows = append(rows, row)
	}
	return rows, nil
}

// writePhotos 把相册目录下的原图放进 photos/，保留库中记录的存储文件名。
func writePhotos(writer *zip.Writer, userID int64) error {
	dir := albumlogic.UserDir(userID)
	entries, err := os.ReadDir(dir)
	if err != nil {
		// 从未上传过照片时目录可能不存在，这不算失败。
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if err = copyIntoZip(writer, filepath.Join(dir, entry.Name()), "photos/"+entry.Name()); err != nil {
			return err
		}
	}
	return nil
}

func copyIntoZip(writer *zip.Writer, source, target string) error {
	file, err := os.Open(source)
	if err != nil {
		return err
	}
	defer func() { _ = file.Close() }()

	entry, err := writer.Create(target)
	if err != nil {
		return err
	}
	_, err = io.Copy(entry, file)
	return err
}
