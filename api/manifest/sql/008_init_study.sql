-- 008_init_study.sql
-- 学习域：课程、学习记录、笔记与周目标

CREATE TABLE IF NOT EXISTS `study_course` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `title`       VARCHAR(64)     NOT NULL,
  `unit_label`  VARCHAR(8)      NOT NULL DEFAULT '章' COMMENT '进度单位：章 / 节 / 课',
  `total_units` INT             NOT NULL DEFAULT 10,
  `done_units`  INT             NOT NULL DEFAULT 0,
  `color`       CHAR(7)         NOT NULL DEFAULT '#5F6E9C',
  `sort_order`  INT             NOT NULL DEFAULT 0,
  `created_at`  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at`  DATETIME(3)     NULL COMMENT '软删除，界面上视为隐藏',
  PRIMARY KEY (`id`),
  KEY `idx_user_alive_sort` (`user_id`, `deleted_at`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='学习课程';

CREATE TABLE IF NOT EXISTS `study_session` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `course_id`  BIGINT UNSIGNED NULL,
  `minutes`    INT             NOT NULL COMMENT '本次学习时长，单位分钟',
  `studied_on` DATE            NOT NULL,
  `note`       VARCHAR(255)    NOT NULL DEFAULT '',
  `created_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3)     NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_day` (`user_id`, `deleted_at`, `studied_on`),
  KEY `idx_user_course` (`user_id`, `course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='学习记录';

CREATE TABLE IF NOT EXISTS `study_note` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `title`      VARCHAR(128)    NOT NULL,
  `tag`        VARCHAR(32)     NOT NULL DEFAULT '',
  `content`    VARCHAR(2000)   NOT NULL DEFAULT '',
  `created_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3)     NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_alive` (`user_id`, `deleted_at`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='学习笔记';

CREATE TABLE IF NOT EXISTS `study_setting` (
  `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`            BIGINT UNSIGNED NOT NULL,
  `weekly_goal_minutes` INT            NOT NULL DEFAULT 360 COMMENT '每周学习目标，单位分钟',
  `created_at`         DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`         DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='学习设置';
