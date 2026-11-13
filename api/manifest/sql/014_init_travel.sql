-- 014_init_travel.sql
-- 旅行域：去过的地方与行程记录

CREATE TABLE IF NOT EXISTS `travel_trip` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `title`      VARCHAR(128)    NOT NULL COMMENT '目的地',
  `region`     VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '省份 / 国家',
  `visited_on` DATE            NOT NULL COMMENT '出发日期',
  `days`       INT             NOT NULL DEFAULT 1 COMMENT '行程天数',
  `rating`     TINYINT         NOT NULL DEFAULT 0 COMMENT '1-5 星，0 表示未评分',
  `note`       VARCHAR(500)    NOT NULL DEFAULT '',
  `color`      CHAR(7)         NOT NULL DEFAULT '#B87758',
  `created_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3)     NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_alive_visit` (`user_id`, `deleted_at`, `visited_on`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='旅行足迹';
