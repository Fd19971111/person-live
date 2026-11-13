package album

import (
	"context"
	"io"
	"os"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"
	"github.com/gogf/gf/v2/os/gfile"

	"study/api/internal/utility"
)

// Upload 保存一张照片到本地目录，并写入索引。
func Upload(ctx context.Context, userID int64, category, note string, file *ghttp.UploadFile) (int64, error) {
	if file == nil || strings.TrimSpace(file.Filename) == "" {
		return 0, invalid("请选择要上传的照片")
	}
	if file.Size <= 0 {
		return 0, invalid("照片内容为空")
	}
	if file.Size > maxPhotoSize {
		return 0, invalid("单张照片不能超过 %d MB", maxPhotoSize/(1024*1024))
	}

	var err error
	if category, err = normalizeCategory(category); err != nil {
		return 0, err
	}
	if note, err = normalizeNote(note); err != nil {
		return 0, err
	}
	ext, err := normalizeExt(file.Filename)
	if err != nil {
		return 0, err
	}

	dir := UserDir(userID)
	if err = gfile.Mkdir(dir); err != nil {
		return 0, err
	}
	stored := utility.NewULID() + ext
	if err = copyUpload(file, gfile.Join(dir, stored)); err != nil {
		return 0, err
	}

	originalName := []rune(gfile.Basename(file.Filename))
	if len(originalName) > 128 {
		originalName = originalName[:128]
	}
	result, err := g.DB().Exec(ctx, `
		INSERT INTO album_photo (user_id, category, file_name, original_name, size_bytes, note)
		VALUES (?, ?, ?, ?, ?, ?)`,
		userID, category, stored, string(originalName), file.Size, note)
	if err != nil {
		// 入库失败时把刚落盘的文件清掉，避免目录里留下孤儿文件。
		_ = os.Remove(gfile.Join(dir, stored))
		return 0, err
	}
	if err = ensureCategory(ctx, userID, category); err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

// copyUpload 把上传内容写到目标路径。
func copyUpload(file *ghttp.UploadFile, target string) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	dst, err := os.Create(target)
	if err != nil {
		return err
	}
	defer dst.Close()
	if _, err = io.Copy(dst, src); err != nil {
		return err
	}
	return nil
}
