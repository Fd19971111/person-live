-- 016_init_fitness.sql
-- 运动域：每次运动的时长、距离与消耗

CREATE TABLE IF NOT EXISTS `fitness_record` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`      BIGINT UNSIGNED NOT NULL,
  `activity`     VARCHAR(32)     NOT NULL COMMENT '运动类型，如跑步 / 力量 / 骑行',
  `minutes`      INT             NOT NULL DEFAULT 0 COMMENT '时长，单位分钟',
  `distance_km`  DECIMAL(6,2)    NOT NULL DEFAULT 0 COMMENT '距离，单位公里，0 表示不适用',
  `calories`     INT             NOT NULL DEFAULT 0 COMMENT '消耗，单位千卡',
  `performed_on` DATE            NOT NULL COMMENT '运动日期',
  `note`         VARCHAR(255)    NOT NULL DEFAULT '',
  `color`        CHAR(7)         NOT NULL DEFAULT '#5C927A',
  `created_at`   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deleted_at`   DATETIME(3)     NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_day` (`user_id`, `deleted_at`, `performed_on`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='运动记录';
