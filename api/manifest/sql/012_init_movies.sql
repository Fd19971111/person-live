-- 012_init_movies.sql
-- 电影域：想看的片单、正在看与已看完的记录

CREATE TABLE IF NOT EXISTS `movie_item` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `title`      VARCHAR(128)    NOT NULL,
  `year`       SMALLINT        NOT NULL DEFAULT 0 COMMENT '上映年份，0 表示未填',
  `genre`      VARCHAR(32)     NOT NULL DEFAULT '' COMMENT '类型，如剧情 / 科幻',
  `director`   VARCHAR(64)     NOT NULL DEFAULT '' COMMENT '导演',
  `rating`     DECIMAL(3,1)    NOT NULL DEFAULT 0 COMMENT '个人评分，0-10，0 表示未评分',
  `status`     TINYINT         NOT NULL DEFAULT 1 COMMENT '1 想看 / 2 在看 / 3 已看完',
  `note`       VARCHAR(500)    NOT NULL DEFAULT '',
  `color`      CHAR(7)         NOT NULL DEFAULT '#6389A8',
  `created_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3)     NULL COMMENT '软删除，界面上视为隐藏',
  PRIMARY KEY (`id`),
  KEY `idx_user_alive_status` (`user_id`, `deleted_at`, `status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='电影清单';
