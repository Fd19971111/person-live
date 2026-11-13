package album

import (
	"context"
	"fmt"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gogf/gf/v2/errors/gcode"
	"github.com/gogf/gf/v2/errors/gerror"
	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/os/gfile"
)

// cst 当前只服务国内用户，日期边界按东八区计算。
var cst = time.FixedZone("CST", 8*3600)

// 相册域默认取值、存放位置与限制。
const (
	DefaultCategoryColor = "#5F8C93"
	// URLPrefix 是照片的静态访问前缀，与 cmd 中注册的静态目录保持一致。
	URLPrefix      = "/uploads/album"
	storageSubDir  = "storage/album"
	maxListSize    = 500
	maxPhotoSize   = 20 << 20 // 单张 20MB
	maxCategoryLen = 32
)

var (
	colorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)
	allowedExt   = map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true, ".bmp": true,
	}
)

// Photo 一张照片。
type Photo struct {
	ID           int64
	Category     string
	FileName     string
	OriginalName string
	SizeBytes    int64
	Note         string
	Date         string
	URL          string
}

// Category 相册分类及其照片数量。
type Category struct {
	ID    int64
	Name  string
	Color string
	Count int
}

// Overview 相册页所需的全部数据。
type Overview struct {
	Total      int
	SizeBytes  int64
	Categories []Category
	Photos     []Photo
}

// StorageDir 照片根目录，默认落在 api/storage/album。
func StorageDir() string {
	return gfile.Join(gfile.Pwd(), storageSubDir)
}

// UserDir 某个用户的照片目录。
func UserDir(userID int64) string {
	return gfile.Join(StorageDir(), strconv.FormatInt(userID, 10))
}

// photoURL 拼出照片的静态访问地址，前端可直接用于 img 标签。
func photoURL(userID int64, fileName string) string {
	return URLPrefix + "/" + strconv.FormatInt(userID, 10) + "/" + fileName
}

func invalid(format string, args ...any) error {
	return gerror.NewCode(gcode.CodeInvalidParameter, fmt.Sprintf(format, args...))
}

func countSQL(ctx context.Context, query string, args ...any) (int, error) {
	value, err := g.DB().GetValue(ctx, query, args...)
	if err != nil {
		return 0, err
	}
	return value.Int(), nil
}

func normalizeColor(color string) (string, error) {
	color = strings.TrimSpace(color)
	if color == "" {
		return DefaultCategoryColor, nil
	}
	if !colorPattern.MatchString(color) {
		return "", invalid("颜色需为 #RRGGBB 格式")
	}
	return strings.ToLower(color), nil
}

// normalizeCategory 相册名允许为空，表示未分类。
func normalizeCategory(name string) (string, error) {
	name = strings.TrimSpace(name)
	if len([]rune(name)) > maxCategoryLen {
		return "", invalid("相册名不能超过 %d 个字符", maxCategoryLen)
	}
	return name, nil
}

func normalizeNote(note string) (string, error) {
	note = strings.TrimSpace(note)
	if len([]rune(note)) > 255 {
		return "", invalid("备注不能超过 255 个字符")
	}
	return note, nil
}

func normalizeExt(name string) (string, error) {
	ext := strings.ToLower(filepath.Ext(strings.TrimSpace(name)))
	if !allowedExt[ext] {
		return "", invalid("只支持 jpg、png、gif、webp、bmp 格式的图片")
	}
	return ext, nil
}

// SizeText 把字节数写成 820 B / 1.4 MB。
func SizeText(bytes int64) string {
	switch {
	case bytes <= 0:
		return "0 B"
	case bytes < 1024:
		return fmt.Sprintf("%d B", bytes)
	case bytes < 1024*1024:
		return fmt.Sprintf("%.0f KB", float64(bytes)/1024)
	default:
		return fmt.Sprintf("%.1f MB", float64(bytes)/(1024*1024))
	}
}

func timestampText(day time.Time) string {
	return fmt.Sprintf("%d月%d日", day.Month(), day.Day())
}

// parseDay 解析 YYYY-MM-DD，统一落在当天零点。
func parseDay(value string) (time.Time, error) {
	value = strings.TrimSpace(value)
	if len(value) > 10 {
		value = value[:10]
	}
	for _, layout := range []string{"2006-01-02", "2006-1-2"} {
		if parsed, err := time.ParseInLocation(layout, value, cst); err == nil {
			return parsed, nil
		}
	}
	return time.Time{}, invalid("日期格式应为 YYYY-MM-DD")
}
