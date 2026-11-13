-- 005_init_plan.sql
-- 计划域：分类与任务

CREATE TABLE IF NOT EXISTS `plan_category` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `name`       VARCHAR(32)     NOT NULL,
  `color`      CHAR(7)         NOT NULL DEFAULT '#6C9E8D',
  `sort_order` INT             NOT NULL DEFAULT 0,
  `created_at` DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deleted_at` DATETIME(3)     NULL COMMENT '软删除，界面上视为隐藏',
  PRIMARY KEY (`id`),
  KEY `idx_user_alive_sort` (`user_id`, `deleted_at`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='计划分类';

CREATE TABLE IF NOT EXISTS `plan_task` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`      BIGINT UNSIGNED NOT NULL,
  `category_id`  BIGINT UNSIGNED NULL,
  `title`        VARCHAR(128)    NOT NULL,
  `note`         VARCHAR(512)    NOT NULL DEFAULT '',
  `status`       TINYINT         NOT NULL DEFAULT 1 COMMENT '1 待处理 2 进行中 3 已完成',
  `due_date`     DATE            NULL,
  `sort_order`   INT             NOT NULL DEFAULT 0,
  `completed_at` DATETIME(3)     NULL,
  `created_at`   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `deleted_at`   DATETIME(3)     NULL COMMENT '软删除，界面上视为隐藏',
  PRIMARY KEY (`id`),
  KEY `idx_user_status_sort` (`user_id`, `deleted_at`, `status`, `sort_order`),
  KEY `idx_user_due` (`user_id`, `due_date`),
  KEY `idx_user_category` (`user_id`, `category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC COMMENT='计划任务';
