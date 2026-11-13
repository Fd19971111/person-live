-- 010_init_inspiration.sql
-- 灵感域：收藏的灵感、摘录与链接

CREATE TABLE IF NOT EXISTS `inspiration_item` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `title`      VARCHAR(128)    NOT NULL,
  `content`    VARCHAR(2000)   NOT NULL DEFAULT '' COMMENT '灵感正文',
  `tag`        VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '标签',
  `source`     VARCHAR(255)    NOT NULL DEFAULT '' COMMENT '来源，链接或书名',
  `color`      CHAR(7)         NOT NULL DEFAULT '#9B72D2' COMMENT '卡片主题色',
  `pinned`     TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '1 表示置顶',
  `created_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3)     NULL COMMENT '软删除，界面上视为隐藏',
  PRIMARY KEY (`id`),
  KEY `idx_user_alive_pin` (`user_id`, `deleted_at`, `pinned`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='灵感收藏';
