-- 021_init_album.sql
-- 相册域：照片文件本身存放在 api/storage/album/<user_id>/ 下，库里只保存索引与归属

CREATE TABLE IF NOT EXISTS `album_category` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `name`       VARCHAR(32)     NOT NULL COMMENT '相册名',
  `color`      CHAR(7)         NOT NULL DEFAULT '#5F8C93',
  `sort_order` INT             NOT NULL DEFAULT 0,
  `created_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3)     NULL COMMENT '软删除，界面上视为隐藏',
  PRIMARY KEY (`id`),
  KEY `idx_user_alive_sort` (`user_id`, `deleted_at`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='相册分类';

CREATE TABLE IF NOT EXISTS `album_photo` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `category`      VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '相册名，空表示未分类',
  `file_name`     VARCHAR(128)    NOT NULL COMMENT '存储文件名，位于 storage/album/<user_id>/ 下',
  `original_name` VARCHAR(128)    NOT NULL DEFAULT '' COMMENT '上传时的原始文件名',
  `size_bytes`    INT UNSIGNED    NOT NULL DEFAULT 0,
  `note`          VARCHAR(255)    NOT NULL DEFAULT '',
  `created_at`    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at`    DATETIME(3)     NULL COMMENT '软删除，界面上视为隐藏',
  PRIMARY KEY (`id`),
  KEY `idx_user_alive_created` (`user_id`, `deleted_at`, `created_at`),
  KEY `idx_user_category` (`user_id`, `deleted_at`, `category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='相册照片';
